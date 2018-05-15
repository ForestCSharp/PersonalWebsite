import React from 'react'
import Link from 'gatsby-link'

import { rhythm, scale } from '../utils/typography'
import { Menu, Button} from 'antd'
import 'antd/dist/antd.css'

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
      CurrentPath = "Blog"
    }

    return (
      <div
        style={{
          marginLeft: 'auto',
          marginRight: 'auto',
          maxWidth: rhythm(24),
          padding: `${rhythm(1.5)} ${rhythm(3 / 4)}`,
        }}
      >
        {header}
        <Menu mode="horizontal" theme ="dark" selectedKeys={[CurrentPath]}>
          <Menu.Item key="Blog"> <a href="/" rel="noopener noreferrer">Blog</a></Menu.Item>
          <Menu.Item key="PastWork"> <a href="/PastWork" rel="noopener noreferrer">Past Work</a></Menu.Item>
          <Menu.Item key="Bio"> <a href="/Bio" rel="noopener noreferrer">Bio</a></Menu.Item>
          <Menu.Item key="Contact"> <a href="/Contact" rel="noopener noreferrer">Contact</a></Menu.Item>
        </Menu>
        <br/>
        {children()}
      </div>
    )
  }
}

export default Template
