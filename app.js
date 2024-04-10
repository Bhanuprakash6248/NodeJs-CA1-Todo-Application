const express = require('express')

const {open} = require('sqlite')
const sqlite3 = require('sqlite3')

const path = require('path')

const format = require('date-fns/format')
const isMatch = require('date-fns/isMatch')
const isValid = require('date-fns/isValid')

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

const hasDueDateProperty = requestQuery => {
  return requestQuery.dueDate !== undefined
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
  if (item === 'WORK' || item === 'HOME' || item === 'LEARNING') {
    return true
  } else {
    return false
  }
}

const isValidTodoDueDate = item => {
  return isValid(new Date(item))
}

const convertCamelCase = dbObject => {
  return {
    id: dbObject.id,
    todo: dbObject.todo,
    priotity: dbObject.priority,
    status: dbObject.status,
    category: dbObject.category,
    dueDate: dbObject.due_date,
  }
}

app.get('/todos/', async (request, response) => {
  let data = null
  let todoQuery = ''
  const {search_q = '', priority, category, status} = request.query

  switch (true) {
    case hasPriorityAndStatusProperties(request.query):
      todoQuery = `
      SELECT * 
      FROM todo
      WHERE 
        todo LIKE '%${search_q}%'
        AND priority = '${priority}'
        AND status = '${status}';
      `
      if (isValidateStatus(status) && isValidatePriority(priority)) {
        data = await db.all(todoQuery)
        response.send(data.map(each => convertCamelCase(each)))
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
        AND priority = '${priority}'
        AND category = '${category}';       
      `
      if (isValidateCategory(category) && isValidatePriority(priority)) {
        data = await db.all(todoQuery)
        response.send(data.map(each => convertCamelCase(each)))
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
        response.send(data.map(each => convertCamelCase(each)))
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
        response.send(data.map(each => convertCamelCase(each)))
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
        response.send(data.map(each => convertCamelCase(each)))
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
        response.send(data.map(each => convertCamelCase(each)))
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
      response.send(data.map(each => convertCamelCase(each)))
  }
})

//API -2

app.get('/todos/:todoId/', async (request, response) => {
  const {todoId} = request.params
  const selectedQuery = `
  SELECT *
  FROM todo
  WHERE id = ${todoId};
  `
  const dbResponse = await db.get(selectedQuery)
  response.send(convertCamelCase(dbResponse))
})

//API - 3
app.get('/agenda/', async (request, response) => {
  const {date} = request.query
  console.log(isMatch(date, 'yyyy-MM-dd'))
  if (date === undefined) {
    response.status(400)
    response.send('Invalid Due Date')
  } else {
    if (isValidTodoDueDate(date)) {
      const newDate = format(new Date(date), 'yyyy-MM-dd')
      console.log(newDate)
      const getQuery = `
      SELECT *
      FROM todo
      WHERE 
      due_date = "${newDate}";
      `
      const data = await db.all(getQuery)
      response.send(data.map(each => convertCamelCase(each)))
    } else {
      response.status(400)
      response.send('Invalid Due Date')
    }
  }
})

//API-4
app.post('/todos/', async (request, response) => {
  const todoDetails = request.body
  const {id, todo, priority, status, category, dueDate} = todoDetails

  switch (false) {
    case isValidatePriority(priority):
      response.status(400)
      response.send('Invalid Todo Priority')
      break
    case isValidateStatus(status):
      response.status(400)
      response.send('Invalid Todo Status')
      break
    case isValidateCategory(category):
      response.status(400)
      response.send('Invalid Todo Category')
      break
    case isValidTodoDueDate(dueDate):
      response.status(400)
      response.send('Invalid Todo Due Date')
      break
    default:
      const newDate = format(new Date(dueDate), 'yyyy-MM-dd')
      const todoQueryInsert = `
        INSERT INTO 
        todo(id,todo,priority,status,category,due_date)
        VALUES (
          ${id},
          '${todo}',
          '${priority}',
          '${status}',
          '${category}',
          '${newDate}',  
        );
        `
      await db.run(todoQueryInsert)
      response.send('Todo Successfully Added')
      break
  }
})

//API-5 --> Update todo of specified ID
app.put('/todos/:todoId/', async (request, response) => {
  const {todoId} = request.params
  const todoDetails = request.body
  const {status, priority, todo, category, dueDate} = todoDetails
  let updatedQuery = ''
  switch (true) {
    case status !== undefined:
      updatedQuery = `
      UPDATE todo
      SET
        status = "${status}"
      WHERE
        id = ${todoId};
      `
      if (isValidateStatus(status)) {
        await db.run(updatedQuery)
        response.send('Status Updated')
      } else {
        response.status(400)
        response.send('Invalid Todo Status')
      }
      break
    case priority !== undefined:
      updatedQuery = `
      UPDATE todo
      SET
        priority = "${priority}"
      WHERE
        id = ${todoId};
      `
      if (isValidatePriority(priority)) {
        await db.run(updatedQuery)
        response.send('Priority Updated')
      } else {
        response.status(400)
        response.send('Invalid Todo Priority')
      }
      break
    case category !== undefined:
      updatedQuery = `
      UPDATE todo
      SET
        category = "${category}"
      WHERE
        id = ${todoId};
      `
      if (isValidateCategory(status)) {
        await db.run(updatedQuery)
        response.send('Category Updated')
      } else {
        response.status(400)
        response.send('Invalid Todo category')
      }

      break

    case dueDate !== undefined:
      updatedQuery = `
      UPDATE todo
      SET
        due_date = "${dueDate}"
      WHERE
        id = ${todoId};
      `
      if (isValidTodoDueDate(dueDate)) {
        await db.run(updatedQuery)
        response.send('Due Date Updated')
      } else {
        response.status(400)
        response.send('Invalid Todo due Date')
      }

      break
    default:
      updatedQuery = `
          UPDATE todo
          SET
            todo = "${todo}"
          WHERE
            id = ${todoId};
          `
      await db.run(updatedQuery)
      response.send('Todo Updated')
      break
  }
})

//Delete todo API

app.delete('/todos/:todoId/', async (request, response) => {
  const {todoId} = request.params
  const deleteQuery = `
    DELETE FROM 
    todo
    WHERE
    id = ${todoId};
  `
  await db.run(deleteQuery)
  response.send('Todo Deleted')
})

module.exports = app
