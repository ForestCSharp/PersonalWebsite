import React from 'react'
import { withPrefix } from 'gatsby-link'

import * as THREE from 'three'

// Import typefaces
import 'typeface-montserrat'
import 'typeface-merriweather'

import { rhythm } from '../utils/typography'

class Bio extends React.Component {

  render() {
    return (
      <div>
        <div
          style={{
            display: 'flex',
          }}
        >
          <p>
            Graphics Programmer {' '}
            <br/>
            <a href="https://github.com/ForestCSharp">
              GitHub
            </a>
          </p>
        </div>
      </div>
    )
  }
}

export default Bio
