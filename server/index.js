require('import-export')
require('babel-core/register')({ presets: ['es2015', 'react'] })

const http = require('http')
const path = require('path')
const fs = require('fs')
const express = require('express')
const react = require('react')
const reactDomServer = require('react-dom/server')//used to render on server
const reactRouter = require('react-router')

const renderToString = reactDomServer.renderToString  //render jsx to html as strings
const match = reactRouter.match //browserHistory causes problems on server, so use match
const RouterContext = reactRouter.RouterContext //base react element to render on the server

//serving up all assets
const staticFiles = [
  '/static/*',  //everything from static folder
  '/logo.svg',
  '/asset-manifest.json',
  '/favicon.ico'
]

//to serve assets init express server
const app = express()
app.server = http.createServer(app)
app.use(express.static('../build'))

//for each file in staticFiles array, serve reqd file based on req.url
staticFiles.forEach(file => {
  app.get(file, (req, res) => {
    const filePath = path.join( __dirname, '../build', req.url )
    res.sendFile( filePath )
  })
})

const routes = require('../src/routes').default() //because this index.js does NOT support import/export

//rendering on server ~ for all other routes
app.get('*', (req, res) => {
  const error = () => res.status(404).send('404 pagerino not founderino -_- ')
  const htmlFilePath = path.join(__dirname, '../build', 'index.html')//get html in build created after build

  fs.readFile( htmlFilePath, 'utf8', (err, htmlData) => {
    if(err){
      error()
    }
    else {
      //get browserHistory via match and match with whatever route user is requesting
      match({routes, location: req.url}, (err, redirect, ssrData) => { //ssrData is server-side rendered data
        if(err){
          error()
        }
        else if(redirect){
          res.redirect(302, redirect.pathname + redirect.search)
        }
        else if(ssrData){
          //do server-side rendering
          //const ReactApp = renderToString(<RouterContext {... ssrData}/>) //not supported
          const ReactApp = renderToString(react.createElement(RouterContext, ssrData))
          const SSRApp = htmlData.replace('{{SSR}}', ReactApp) //server-side rendered app - replace {{SSR}} with JSX-to-String Content
          res.status(200).send(SSRApp)
        }
        else {
          error()
        }
      })
    }
  })

})

//use specified port or 8080
app.server.listen(process.env.PORT || 8080)
console.log(`Listening on http://localhost:${app.server.address().port}`)
