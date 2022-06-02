const { Sequelize, DataTypes, Model } = window.nodeRequire('sequelize')
const os = window.nodeRequire('os')
const path = window.nodeRequire('path')
const sqlite3 = window.nodeRequire('sqlite3')
const fs = window.nodeRequire('fs')

const storage = path.normalize(`${os.homedir()}/.uiauto/database/local.sqlite`)
if (!fs.existsSync(path.dirname(storage))) {
  fs.mkdirSync(path.dirname(storage), { recursive: false })
}
if (!fs.existsSync(storage)) {
  fs.writeFileSync(storage, Buffer.from([]))
}
export const sequelize = new Sequelize({
  dialect: 'sqlite',
  storage: storage,
  dialectOptions: {
    mode: sqlite3.OPEN_READWRITE
  },
  logging: function () { },
})

export class Task extends Model { }

Task.init({
  // Model attributes are defined here
  id: {
    type: DataTypes.INTEGER,
    autoIncrement: true,
    primaryKey: true
  },
  taskName: {
    type: DataTypes.STRING,
    allowNull: false
  },
  name: {
    type: DataTypes.STRING,
    allowNull: false
  },
  triggerMethod: {
    type: DataTypes.STRING(10),
    allowNull: false
  },
  status: {
    type: DataTypes.STRING(10),
    allowNull: false
  }
}, {
  // Other model options go here
  sequelize, // We need to pass the connection instance
  modelName: 'Task' // We need to choose the model name
})

export class Log extends Model { }
Log.init({
  id: {
    type: DataTypes.INTEGER,
    autoIncrement: true,
    primaryKey: true
  },
  taskId: {
    type: DataTypes.INTEGER,
    allowNull: false
  },
  logType: {
    type: DataTypes.STRING,
    allowNull: false
  },
  content: {
    type: DataTypes.TEXT,
    allowNull: true
  },
  lineNo: {
    type: DataTypes.INTEGER,
    allowNull: false
  }
}, {
  sequelize,
  modelName: 'Log'
})

