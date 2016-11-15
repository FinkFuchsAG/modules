const Promise = require('bluebird')
const moment = require('moment')

var knex = null

function initialize() {
  if (!knex) {
    throw new Error('you must initialize the database before')
  }

  return knex.schema.createTableIfNotExists('broadcast_schedules', function (table) {
    table.increments('id').primary()
    table.string('date_time')
    table.timestamp('ts')
    table.string('text')
    table.string('type')
    table.boolean('outboxed')
    table.integer('total_count')
    table.integer('sent_count')
    table.timestamp('created_on')
  })
  .then(function() {
    return knex.schema.createTableIfNotExists('broadcast_outbox', function (table) {
      table.string('scheduleId').references('schedules.id')
      table.string('userId').references('users.id')
      table.primary(['scheduleId', 'userId'])
      table.timestamp('ts')
    })
  })
}

function addSchedule({ dateTime, userTimezone, content, type }) {

  const row = {
    date_time: moment(new Date(dateTime)).format('YYYY-MM-DD HH:mm'),
    ts: userTimezone ? null : moment(new Date(dateTime)).format('x'),
    text: content,
    type: type,
    outboxed: false,
    total_count: 0,
    sent_count: 0,
    created_on: moment(new Date()).format('x')
  }

  return knex('broadcast_schedules')
  .insert(row, 'id')
  .then().get(0)
}

function updateSchedule({ id, dateTime, userTimezone, content, type }) {

  const row = {
    date_time: moment(new Date(dateTime)).format('YYYY-MM-DD HH:mm'),
    ts: userTimezone ? null : moment(new Date(dateTime)).format('x'),
    text: content,
    type: type
  }

  return knex('broadcast_schedules')
  .where({ id: id, outboxed: 0 })
  .update(row)
  .then(result => {
    console.log('UPDATE RESULT', result)
  })
}

function deleteSchedule(id) {
  return knex('broadcast_schedules')
  .where(id: id)
  .delete()
  .then(() => {
    return knex('broadcast_outbox')
    .where(scheduleId: id)
    .del()
    .then(() => true)
  })
}

function listSchedules() {
  return knex('broadcast_schedules')
  .then(rows => {

  })
}

module.exports = (k) => {
  knex = k
  return { initialize, addSchedule, deleteSchedule, updateSchedule, listSchedules }
}