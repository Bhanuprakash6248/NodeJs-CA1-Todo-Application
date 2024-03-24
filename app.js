const express = require('express')

const {open} = require('sqlite')
const sqlite3 = require('sqlite3')

const path = require('path')

const addDate = require('date-fns')
const app = express()
app.use(express.json())

let db = null
const dbPath = path.join(__dirname, 'todoApplication.db')

//Initalising the DB and Server

const initializeDbAndServer = async () => {
  try {
    db = await open({
      filename: dbPath,
      driver: sqlite3.Database,
    })
    app.listen(3000, () => {
      console.log('server is running at http://localhost:3000')
    })
  } catch (e) {
    console.log(`DB Error:${e.message}`)
    process.exit(1)
  }
}

initializeDbAndServer()

module.exports = app

const hasPriorityAndStatusProperties = requestQuery => {
  return (
    requestQuery.priority !== undefined && requestQuery.status !== undefined
  )
}
const hasCategoryAndStatusProperties = requestQuery => {
  return (
    requestQuery.category !== undefined && requestQuery.status !== undefined
  )
}
const hasCategoryAndPriorityProperties = requestQuery => {
  return (
    requestQuery.category !== undefined && requestQuery.priority !== undefined
  )
}
const hasCategoryProperty = requestQuery => {
  return requestQuery.category !== undefined
}

const hasPriorityProperty = requestQuery => {
  return requestQuery.priotity !== undefined
}

const hasStatusProperty = requestQuery => {
  return requestQuery.status !== undefined
}
const hasSearchProperty = requestQuery => {
  return requestQuery.search_q !== undefined
}

const isValidatePriority = item => {
  if (item === 'HIGH' || item === 'MEDIUM' || item === 'LOW') {
    return true
  } else {
    return false
  }
}
const isValidateStatus = item => {
  if (item === 'TO DO' || item === 'IN PROGRESS' || item === 'DONE') {
    return true
  } else {
    return false
  }
}
const isValidateCategory = item => {
  if (item === ' WORK' || item === 'HOME' || item === 'LEARNING') {
    return true
  } else {
    return false
  }
}

app.get('/todos/', async (request, response) => {
  let data = null
  let todoQuery = ''
  const {search_q, priority, category, status} = request.query
  switch (true) {
    case hasPriorityAndStatusProperties(request.query):
      todoQuery = `
      SELECT * 
      FROM todo
      WHERE 
        todo LIKE '%${search_q}%'
        AND prirority = '${priority}'
        AND status = '${status}';
      `
      if (isValidateStatus(status) && isValidatePriority(priority)) {
        data = await db.all(todoQuery)
        response.send(data)
      } else if (isValidatePriority(priority)) {
        response.status(400)
        response.send('Invalid Todo status')
      } else {
        response.status(400)
        response.send('Invalid Todo Priority')
      }
      break
    case hasCategoryAndPriorityProperties(request.query):
      todoQuery = `
      SELECT * 
      FROM todo
      WHERE 
        todo LIKE '%${search_q}%'
        AND prirority = '${priority}'
        AND category = '${category}';       
      `
      if (isValidateCategory(category) && isValidatePriority(priority)) {
        data = await db.all(todoQuery)
        response.send(data)
      } else if (isValidatePriority(priority)) {
        response.status(400)
        response.send('Invalid Todo Category')
      } else {
        response.status(400)
        response.send('Invalid Todo Priority')
      }
      break
    case hasCategoryAndStatusProperties(request.query):
      todoQuery = `
      SELECT * 
      FROM todo
      WHERE 
        todo LIKE '%${search_q}%'
        AND status = '${status}'
        AND category = '${category}';       
      `
      if (isValidateCategory(category) && isValidateStatus(status)) {
        data = await db.all(todoQuery)
        response.send(data)
      } else if (isValidateCategory(category)) {
        response.status(400)
        response.send('Invalid Todo Status')
      } else {
        response.status(400)
        response.send('Invalid Todo Category')
      }
      break
    case hasCategoryProperty(request.query):
      todoQuery = `
      SELECT * 
      FROM todo
      WHERE 
        todo LIKE '%${search_q}%'
        AND category = '${category}';       
      `
      if (isValidateCategory(category)) {
        data = await db.all(todoQuery)
        response.send(data)
      } else {
        response.status(400)
        response.send('Invalid Todo Category')
      }
      break
    case hasPriorityProperty(request.query):
      todoQuery = `
      SELECT * 
      FROM todo
      WHERE 
        todo LIKE '%${search_q}%'
        AND priority = '${priority}';       
      `
      if (isValidatePriority(priority)) {
        data = await db.all(todoQuery)
        response.send(data)
      } else {
        response.status(400)
        response.send('Invalid Todo Priority')
      }
      break
    case hasStatusProperty(request.query):
      todoQuery = `
      SELECT * 
      FROM todo
      WHERE 
        todo LIKE '%${search_q}%'
        AND status= '${status}';       
      `
      if (isValidateStatus(status)) {
        data = await db.all(todoQuery)
        response.send(data)
      } else {
        response.status(400)
        response.send('Invalid Todo Status')
      }
      break
    default:
      todoQuery = `
      SELECT * 
      FROM todo
      WHERE 
        todo LIKE '%${search_q}%';       
      `
      data = await db.all(todoQuery)
      response.send(data)
  }
})
