import React from 'react'
import Link from 'gatsby-link'

import { rhythm, scale } from '../utils/typography'

import '../stylesheets/main.css'

var CommonLinkStyle = {
  paddingRight: 20,
  paddingLeft : 20,
  textDecoration: "none",
  color: "#333333",
  padding: "2px 6px 2px 6px",
  borderRight: "1px solid #CCCCCC",
  borderLeft: "1px solid #CCCCCC",
  flex: 1,
}

var LinkStyle = Object.assign({backgroundColor: "#2288FF"}, CommonLinkStyle)

var CurrentLinkStyle = Object.assign({backgroundColor: "#66CCFF"}, CommonLinkStyle)

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
    //CurrentPath = CurrentPath.replace("/", "")
    if (CurrentPath.length == 0)
    {
      //CurrentPath = "blog"
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

        <div style={{display: "flex", flexDirection: "row"}}>
          <a href="/" style={CurrentPath == "/" ? CurrentLinkStyle : LinkStyle}> Blog </a>
          <a href="/pastwork" style={CurrentPath == "/pastwork" ? CurrentLinkStyle : LinkStyle}> Past Work </a>
          <a href="/bio" style={CurrentPath == "/bio" ? CurrentLinkStyle : LinkStyle}> Bio </a>
          <a href="/contact" style={CurrentPath == "/contact" ? CurrentLinkStyle : LinkStyle}> Contact </a>
        </div>

        <br/>
        {children()}
      </div>
    )
  }
}

export default Template
