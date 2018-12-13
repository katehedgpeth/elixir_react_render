const ReactServer = require('react-dom/server')
const React = require('react')
const readline = require('readline')

require('babel-polyfill')
require('@babel/register')({
  presets: [
    "@babel/preset-env",
    "@babel/preset-react"
  ]
})

function deleteCache(componentPath) {
  if (
    process.env.NODE_ENV !== 'production' &&
    require.resolve(componentPath) in require.cache
  ) {
    delete require.cache[require.resolve(componentPath)]
  }
}

function makeHtml({path, props}) {
  try {
    const componentPath = path

    // remove from cache in non-production environments
    // so that we can see changes
    deleteCache(componentPath)

    const component = require(componentPath)
    const element = component.default ? component.default : component
    const createdElement = React.createElement(element, props)

    const markup = ReactServer.renderToString(createdElement)

    const response = {
      error: null,
      markup: markup,
      component: element.name,
    }

    return response
  } catch (err) {
    const response = {
      error: {
        type: err.constructor.name,
        message: err.message,
        stack: err.stack,
      },
      markup: null,
      component: null,
    }

    return response
  }
}

function startServer() {
  process.stdin.on('end', () => {
    process.exit()
  })

  const readLineInterface = readline.createInterface({
    input: process.stdin,
    output: process.stdout,
    terminal: false,
  })

  readLineInterface.on('line', line => {
    input = JSON.parse(line)
    result = makeHtml(input)
    jsonResult = JSON.stringify(result)
    process.stdout.write(jsonResult)
  })
}

module.exports = {startServer}

if (require.main === module) {
  startServer()
}
