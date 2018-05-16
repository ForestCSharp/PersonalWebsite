import React from 'react'

var email = "forestcollinssharp@gmail.com"
var github = "https://github.com/ForestCSharp"

var rowFlex = {
    display: "flex",
    flexDirection: "row"
}

var sectionPadding = {
    paddingRight: 10
}

var linkStyle = {
    boxShadow: "none",
}

class ContactSection extends React.Component {
    render() {
        return (
            <div style={rowFlex}>
                <p style={sectionPadding}>{this.props.title}</p>
                <a style = {linkStyle} href={this.props.link}>{this.props.linkName}</a>
            </div>
        )
    }
}

class Contact extends React.Component {
    render() {
        return (
            <div>
                <ContactSection title={"Email:"} link={"mailto:" + email} linkName={email}/>
                <ContactSection title={"Github:"} link = {github} linkName={github}/>
            </div>
        )
    }
}

export default Contact