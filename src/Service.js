// ~~~~~~~~~~~~~~~~~~~~ IMPORTS ~~~~~~~~~~~~~~~~~~~~ //

// NodeJS native
const path = require('path');

// NPM packages
const _ = require('lodash');
const shell = require('shelljs');

// Custom
const { exec } = require('./helpers/exec');
const { addUserToSDDL } = require('./helpers/windows');
const ServiceAccount = require('./service-components/ServiceAccount');
const ServiceLog = require('./service-components/ServiceLog');
const XmlBuilder = require('./XmlBuilder');

// ~~~~~~~~~~~~~~~~~~~~ CLASS ~~~~~~~~~~~~~~~~~~~~ //

class Service {
  constructor(lib) {
    // Validate input library
    if (_.isNull(lib) || _.isUndefined(lib)) {
      throw new TypeError('Service constructor should be supplied with a library object, received no input arguments.');
    } else if (!_.isObject(lib)) {
      throw new TypeError(`Service constructor should be supplied with a library object, received ${typeof lib}.`);
    } else if (!_.has(lib, 'id')) {
      throw new RangeError('Service options library should have an ID field.');
    } else if (!_.has(lib, 'name')) {
      throw new RangeError('Service options library should have a name field.');
    } else if (!_.has(lib, 'executable')) {
      throw new RangeError('Service options library should have an executable field.');
    } else if (!_.has(lib, 'configDirectory')) {
      throw new RangeError('Service options library should have a configuration directory field.');
    }
    // Set required options
    this.id = lib.id;
    this.name = lib.name;
    this.executable = lib.executable;
    this.configDirectory = lib.configDirectory;
    this.winswExec = path.join(__dirname, '..', 'bin', 'winsw', 'winsw.exe');

    // Parse and set optional config
    this.description = lib.description || null;
    this.args = lib.args || null;
    this.log = lib.log || null;
    this.serviceaccount = lib.serviceaccount || null;
  }

  get id() {
    return this._id;
  }

  set id(id) {
    if (_.isNull(id) || _.isUndefined(id)) {
      throw new TypeError('Service ID should be defined and of type string.');
    } else if (!_.isString(id)) {
      throw new TypeError(`Service ID should be of type string, received ${typeof id}.`);
    } else if (id.length === 0) {
      throw new RangeError('Service ID should not be an empty string.');
    }
    this._id = id;
  }

  get name() {
    return this._name;
  }

  set name(name) {
    if (_.isNull(name) || _.isUndefined(name)) {
      throw new TypeError('Service name should be defined and of type string.');
    } else if (!_.isString(name)) {
      throw new TypeError(`Service name should be of type string, received ${typeof name}.`);
    } else if (name.length === 0) {
      throw new RangeError('Service name should not be an empty string.');
    }
    this._name = name;
  }

  get executable() {
    return this._executable;
  }

  set executable(executable) {
    if (_.isNull(executable) || _.isUndefined(executable)) {
      throw new TypeError('Service executable should be defined and of type string.');
    } else if (!_.isString(executable)) {
      throw new TypeError(`Service executable should be of type string, received ${typeof executable}.`);
    } else if (executable.length === 0) {
      throw new RangeError('Service executable should not be an empty string.');
    } else if (!shell.which(executable) || !shell.test('-ef', executable)) {
      throw new RangeError('Service executable should be in the PATH variable or an absolute path.');
    }
    this._executable = executable;
  }

  get configDirectory() {
    return this._configDirectory;
  }

  get configPath() {
    return this._configPath;
  }

  set configDirectory(configDirectory) {
    if (_.isNull(configDirectory) || _.isUndefined(configDirectory)) {
      throw new TypeError('Service configuration directory should be defined and of type string.');
    } else if (!_.isString(configDirectory)) {
      throw new TypeError(`Service configuration directory should be of type string, received ${typeof configDirectory}.`);
    } else if (configDirectory.length === 0) {
      throw new RangeError('Service configuration directory should not be an empty string.');
    }
    // Create absolute path
    let configDir = configDirectory;
    if (!path.isAbsolute(configDir)) {
      configDir = path.resolve(process.cwd(), configDir);
    }
    // Create configuration directory if necessary
    if (!shell.test('-ed', configDir)) {
      shell.mkdir('-p', configDir);
    }
    this._configDirectory = configDir;
    this._configPath = path.join(configDir, `${this.id}.service.xml`);
  }

  get winswExec() {
    return this._winswExec;
  }

  set winswExec(winswExec) {
    this._winswExec = winswExec;
  }

  get description() {
    return this._description;
  }

  set description(description) {
    if (!_.isNull(description)) {
      if (_.isUndefined(description)) {
        throw new TypeError('Service description cannot be undefined.');
      } else if (!_.isString(description)) {
        throw new TypeError(`Service description should be of type string, received ${typeof description}.`);
      } else if (description.length === 0) {
        throw new RangeError('Service description should not be an empty string.');
      }
      this._description = description;
    }
  }

  get args() {
    return this._args;
  }

  set args(args) {
    if (!_.isNull(args)) {
      if (_.isUndefined(args)) {
        throw new TypeError('Service arguments cannot be undefined.');
      } else if (!_.isArray(args)) {
        throw new TypeError(`Service arguments should be of type array, received ${typeof args}.`);
      } else if (args.length === 0) {
        throw new RangeError('Service arguments array should have at least one entry.');
      }
    }
    this._args = args;
  }

  get log() {
    return this._log;
  }

  set log(log) {
    if (!_.isNull(log)) {
      if (_.isUndefined(log)) {
        throw new TypeError('Service log configuration cannot be undefined.');
      } else if (!_.isObject(log)) {
        throw new TypeError(`Service log configuration should be of type object, received ${typeof log}.`);
      } else if (Object.keys(log).length === 0) {
        throw new RangeError('Service log configuration should have at least one key.');
      }
      this._log = new ServiceLog(log);
    } else {
      this._log = log;
    }
  }

  get serviceaccount() {
    return this._serviceaccount;
  }

  set serviceaccount(serviceaccount) {
    if (!_.isNull(serviceaccount)) {
      if (_.isUndefined(serviceaccount)) {
        throw new TypeError('Service account configuration cannot be undefined.');
      } else if (!_.isObject(serviceaccount)) {
        throw new TypeError(`Service account configuration should be of type object, received ${typeof serviceaccount}.`);
      } else if (Object.keys(serviceaccount).length === 0) {
        throw new RangeError('Service account configuration should have at least one key.');
      }
      this._serviceaccount = new ServiceAccount(serviceaccount);
    } else {
      this._serviceaccount = serviceaccount;
    }
  }

  toJsonConfig() {
    const jsonConfig = {
      service: {},
    };
    // Add service ID
    jsonConfig.service.id = this.id;
    // Add service Name
    jsonConfig.service.name = this.name;
    // Add service executable
    jsonConfig.service.executable = this.executable;
    // Add service description
    if (this.description) {
      jsonConfig.service.description = this.description;
    }
    // Add service arguments
    if (this.args) {
      jsonConfig.service.arguments = this.args.join(' ');
    }
    // Add service logger
    if (this.log) {
      _.assignIn(jsonConfig.service, this.log.toJsonConfig());
    }
    // Add service account
    if (this.serviceaccount) {
      _.assignIn(jsonConfig.service, this.serviceaccount.toJsonConfig());
    }
    return jsonConfig;
  }

  toXmlString() {
    // Get config as JSON
    const jsonConfig = this.toJsonConfig();
    // Return XML string

    return XmlBuilder.fromJSON(jsonConfig);
  }

  writeXmlConfigFile() {
    // If config file already exists, replace
    if (shell.test('-ef', this.configPath)) {
      shell.rm('-f', this.configPath);
    }
    // Write config file
    const xmlString = this.toXmlString();
    shell.touch(this.configPath);
    shell.ShellString(xmlString).to(this.configPath);
  }

  async install() {
    // Create XML config file
    this.writeXmlConfigFile();
    // Construct installation command
    let cmd = `${this.winswExec} install ${this.configPath}`;
    // Add username if present
    if (this.serviceaccount && this.serviceaccount.username) {
      cmd += ` --user ${this.serviceaccount.username}`;
    }
    // Add password if present
    if (this.serviceaccount && this.serviceaccount.username && this.serviceaccount.password) {
      cmd += ` --pass ${this.serviceaccount.password}`;
    }
    // Execute winsw with config file
    await exec(cmd);
    // Add username to service SDDL if present
    if (this.serviceaccount && this.serviceaccount.username) {
      addUserToSDDL(this.id, this.serviceaccount.username);
    }
  }

  async uninstall() {
    // Execute winsw with config file
    await exec(`${this.winswExec} uninstall ${this.configPath}`);
    // Remove config file
    shell.rm('-f', this.configPath);
  }

  async start() {
    // Execute winsw with config file
    await exec(`${this.winswExec} start ${this.configPath}`);
  }

  async stop() {
    // Execute winsw with config file
    await exec(`${this.winswExec} stop ${this.configPath}`);
  }

  async reinstall() {
    // Execute uninstall of service
    await this.uninstall();
    // Execute install of service
    await this.install();
  }

  async restart() {
    // Stop service
    await this.stop();
    // Start service
    await this.start();
  }
}

exports.Service = Service;
