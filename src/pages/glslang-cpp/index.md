---
title: Using Glslang as an Online Compiler for Vulkan
date: "2018-05-08"
---

As long as I've been developing with Vulkan, I've wanted an easier way to use GLSL without having to compile to Spir-V using an offline compiler (namely glslangvalidator.exe or glslc.exe). 

Fortunately, the above tools also provide C/C++ Libraries for doing the same thing: [glslang](https://github.com/KhronosGroup/glslang) and [shaderc](https://github.com/google/shaderc).

I opted to use glslang, as its a relatively lightweight library that I could easily add to my [project](https://github.com/ForestCSharp/VkCppRenderer) as a git submodule. ShaderC was nearly as easy to integrate, but is a much larger library, with the initial compile taking much longer and the resulting binaries fairly large. The compilation process using glslang as a C/C++ library is based heavily upon the [StandAlone (glslangvalidator.exe)](https://github.com/KhronosGroup/glslang/blob/master/StandAlone/StandAlone.cpp) compiler's implementation. Below is a walkthrough on how I'm using glslang to preprocess and compile my GLSL files to Spir-V. This post moves fairly linearly through ["ShaderCompiler.hpp"](https://github.com/ForestCSharp/VkCppRenderer/blob/master/Src/Renderer/GLSL/ShaderCompiler.hpp) found in the project linked above.

#Project Setup

The CMake setup for glslang is super easy. Just add the glslang subdirectory (or locate the library in another way), set up the include directories, and then link with glslang and SpirV

```CMake

#setting a lib directory
set(LIB_DIRECTORY ${CMAKE_CURRENT_SOURCE_DIR}/Libs)

...

#add project as a subdirectory in our project
add_subdirectory(${LIB_DIRECTORY}/glslang)

#files we'd like to be able to include
include_directories(${LIB_DIRECTORY}/glslang)

...

#Link With glslang and SPIRV
target_link_libraries(ScalpelRenderer glslang SPIRV)
```

#Includes

```c++
#include <glslang/public/ShaderLang.h>
#include <SPIRV/GlslangToSpv.h>
#include <StandAlone/DirStackFileIncluder.h>

#include <iostream>
#include <fstream>
#include <string>
#include <vector>
```
"ShaderLang.h" is the primary file one references in order to interface with glslang's API. "GlslangToSpv.h" contains the functionality to convert the AST parsed from our GLSL to Spir-V. "DirStackFileIncluder.h" provides a basic implementation of an includer interface, allowing us to reference other GLSL files in the files we pass to the compiler. 

Note that to enable support for #include, you'll need the GLSL extension "GL\_GOOGLE\_include\_directive" enabled in your shader, which can be done by adding the following at the top of your GLSL files:

```glsl
#extension GL_GOOGLE_include_directive : enable
```

Finally, we'll be using iostream, fstream, string, and vector from the C++ standard library.

#Helper Functions and Structs

Right past the includes, there are three helper functions, all of which operate on the input file string.

The first function merely strips the file off the absolute path passed in. This file path is passed into the includer interface in order for the GLSL to reference files relative to its position in the directory:

```c++
std::string GetFilePath(const std::string& str)
{
	size_t found = str.find_last_of("/\\");
	return str.substr(0,found);
	//size_t FileName = str.substr(found+1);
}
```
The next two functions work in conjunction to determine the shader stage we'd like to compile based on the file extension of the input GLSL:

```c++
std::string GetSuffix(const std::string& name)
{
    const size_t pos = name.rfind('.');
    return (pos == std::string::npos) ? "" : name.substr(name.rfind('.') + 1);
}

EShLanguage GetShaderStage(const std::string& stage)
{
    if (stage == "vert") {
        return EShLangVertex;
    } else if (stage == "tesc") {
        return EShLangTessControl;
    } else if (stage == "tese") {
        return EShLangTessEvaluation;
    } else if (stage == "geom") {
        return EShLangGeometry;
    } else if (stage == "frag") {
        return EShLangFragment;
    } else if (stage == "comp") {
        return EShLangCompute;
    } else {
        assert(0 && "Unknown shader stage");
        return EShLangCount;
    }
}
```
We also define a TBuiltInResource, which describes some limits we'd like to impose when compiling our GLSL to SpirV. These values can be changed to something larger if you'd like to do something like [store all (or most) of your textures in one big array] (http://kylehalladay.com/blog/tutorial/vulkan/2018/01/28/Textue-Arrays-Vulkan.html).

```c++
const TBuiltInResource DefaultTBuiltInResource = { ... };
```

#Setup

Our compilation function accepts an absolute filepath to the GLSL source file and outputs the compiled Spir-V:

```c++
const std::vector<unsigned int> CompileGLSL(const std::string& filename);
```

As mentioned above, the extension name of the input GLSL determines the type of shader that will be compiled, so vertex shaders should have the extension ".vert" and fragment shaders should have ".frag". See above for the rest of the shader stage extension names.

The first thing we need to do before attempting to Preprocess or Compile GLSL with glslang is to initialize it. This only needs to happen once per process:

```c++
if (!glslangInitialized)
{
    glslang::InitializeProcess();
    glslangInitialized = true;
}
```

Next we load our GLSL code into a std::string:

```c++
//Load GLSL into a string
std::ifstream file(filename);

if (!file.is_open()) 
{
    std::cout << "Failed to load shader: " << filename << std::endl;
    throw std::runtime_error("failed to open file: " + filename);
}

std::string InputGLSL((std::istreambuf_iterator<char>(file)),
                        std::istreambuf_iterator<char>());

const char* InputCString = InputGLSL.c_str();
```

Now we use those helper functions to determine our shader type and construct a glslang::TShader using that information:

```c++
EShLanguage ShaderType = GetShaderStage(GetSuffix(filename));
glslang::TShader Shader(ShaderType);
```

We then set the GLSL strings we'd like associated with this shader, of which we only have one:

```c++
Shader.setStrings(&InputCString, 1);
```

Now we set up our available resources, desired messaging, and pass in some Vulkan/SpirV specific flags. A more robust implementation of this would probably fetch the actual Vulkan version you're developing with, as well as the version of Spir-V we'd like to target:

```c++
int ClientInputSemanticsVersion = 100; // maps to, say, #define VULKAN 100
glslang::EShTargetClientVersion VulkanClientVersion = glslang::EShTargetVulkan_1_0;
glslang::EShTargetLanguageVersion TargetVersion = glslang::EShTargetSpv_1_0;

Shader.setEnvInput(glslang::EShSourceGlsl, ShaderType, glslang::EShClientVulkan, ClientInputSemanticsVersion);
Shader.setEnvClient(glslang::EShClientVulkan, VulkanClientVersion);
Shader.setEnvTarget(glslang::EShTargetSpv, TargetVersion);

TBuiltInResource Resources;
Resources = DefaultTBuiltInResource;
EShMessages messages = (EShMessages) (EShMsgSpvRules | EShMsgVulkanRules);

const int DefaultVersion = 100;
```

#Preprocessing

Now we preprocess our GLSL:

```c++
DirStackFileIncluder Includer;

//Get Path of File
std::string Path = GetFilePath(filename);
Includer.pushExternalLocalDirectory(Path);

std::string PreprocessedGLSL;

if (!Shader.preprocess(&Resources, DefaultVersion, ENoProfile, false, false, messages, &PreprocessedGLSL, Includer)) 
{
    std::cout << "GLSL Preprocessing Failed for: " << filename << std::endl;
    std::cout << Shader.getInfoLog() << std::endl;
    std::cout << Shader.getInfoDebugLog() << std::endl;
}
```

We declare a DirStackFileIncluder, and add the input file's path as the only include directory.
We then invoke the preprocessor with this includer, as well as the other information we set up (the TBuiltInResource, DefaultVersion, and messages variables we built up earlier). The new GLSL will be stored in the PreprocessedGLSL string.

At this point, it's important to actually update your shader's string information with the PreprocessedGLSL you just produced:

```c++
const char* PreprocessedCStr = PreprocessedGLSL.c_str();
Shader.setStrings(&PreprocessedCStr, 1);
```

#Compilation

With our GLSL preprocessed, it's now time to actually parse the shader:

```c++
if (!Shader.parse(&Resources, 100, false, messages))
{
    std::cout << "GLSL Parsing Failed for: " << filename << std::endl;
    std::cout << Shader.getInfoLog() << std::endl;
    std::cout << Shader.getInfoDebugLog() << std::endl;
}
```

Now we pass add this parsed shader to a glslang::TProgram and link the program:

```c++
glslang::TProgram Program;
Program.addShader(&Shader);

if(!Program.link(messages))
{
    std::cout << "GLSL Linking Failed for: " << filename << std::endl;
    std::cout << Shader.getInfoLog() << std::endl;
    std::cout << Shader.getInfoDebugLog() << std::endl;
}
```

All that's left to do now is to convert the program's intermediate representation into SpirV:

```c++
std::vector<unsigned int> SpirV;
spv::SpvBuildLogger logger;
glslang::SpvOptions spvOptions;
glslang::GlslangToSpv(*Program.getIntermediate(ShaderType), SpirV, &logger, &spvOptions);

return SpirV;
```

And that's it! Now we have an online shader compiler that allows us to pass GLSL directly into our Vulkan programs.