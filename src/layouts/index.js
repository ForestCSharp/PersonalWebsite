import React from 'react'
import Link from 'gatsby-link'

import { rhythm, scale } from '../utils/typography'

import Menu from 'antd/lib/Menu'
//import 'antd/lib/Menu/style/index.css'

import '../stylesheets/main.css'

class Template extends React.Component {
  render() {
    const { location, children } = this.props
    let header

    let rootPath = `/`
    if (typeof __PREFIX_PATHS__ !== `undefined` && __PREFIX_PATHS__) {
      rootPath = __PATH_PREFIX__ + `/`
    }

    header = (
      <h1
        style={{
          ...scale(1.5),
          marginBottom: rhythm(1.5),
          marginTop: 0,
        }}
      >
        <Link
          style={{
            boxShadow: 'none',
            textDecoration: 'none',
            color: 'inherit',
          }}
          to={'/'}
        >
          Forest Sharp
        </Link>
        
      </h1>
    )

    var CurrentPath = this.props.location.pathname
    CurrentPath = CurrentPath.replace("/", "")
    if (CurrentPath.length == 0)
    {
      CurrentPath = "blog"
    }

    return (
      <div
        style={{
          marginLeft: 'auto',
          marginRight: 'auto',
          maxWidth: rhythm(32),
          padding: `${rhythm(1.5)} ${rhythm(3 / 4)}`,
        }}
      >
        {header}
        <Menu mode="horizontal" theme ="light" selectedKeys={[CurrentPath]}>
          <Menu.Item key="blog"> <a href="/" rel="noopener noreferrer">Blog</a></Menu.Item>
          <Menu.Item key="pastwork"> <a href="/pastwork" rel="noopener noreferrer">Past Work</a></Menu.Item>
          <Menu.Item key="bio"> <a href="/bio" rel="noopener noreferrer">Bio</a></Menu.Item>
          <Menu.Item key="contact"> <a href="/contact" rel="noopener noreferrer">Contact</a></Menu.Item>
        </Menu>

        <br/>
        {children()}
      </div>
    )
  }
}

export default Template
