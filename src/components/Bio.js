import React from 'react'

// Import typefaces
import 'typeface-montserrat'
import 'typeface-merriweather'

import { rhythm } from '../utils/typography'

class Bio extends React.Component {
  render() {
    return (
      <div
        style={{
          display: 'flex',
          marginBottom: rhythm(2.5),
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
    )
  }
}

export default Bio
