
exports.up = function(knex) {
    return knex.schema
      .createTable('users', tbl => {
          // id: primary key
          tbl.increments().unique().notNullable()
          // username: unique required
          tbl.string('username', 63).unique().notNullable()
          // password: required
          tbl.string('password').notNullable()
          // department: required
          tbl.string('department', 63).notNullable()
      })
  };
  
  exports.down = function(knex) {
    return knex.schema
      .dropTable('users')
  };