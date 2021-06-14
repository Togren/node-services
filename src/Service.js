// ~~~~~~~~~~~~~~~~~~~~ IMPORTS ~~~~~~~~~~~~~~~~~~~~ //

// NodeJS native
const path = require('path');

// NPM packages
const _ = require('lodash');
const shell = require('shelljs');

// Custom
const { ADMIN_ACCOUNTS } = require('./helpers/constants');
const { sddlHasUserID, addUserToSDDL, isService } = require('./helpers/windows');
const { exec } = require('./helpers/exec');
const ServiceAccount = require('./service-components/ServiceAccount');
const ServiceLog = require('./service-components/ServiceLog');
const XmlBuilder = require('./XmlBuilder');

// Errors
const InvalidTypeError = require('./errors/InvalidTypeError');
const PropertyRequiredError = require('./errors/PropertyRequiredError');
const ValidationError = require('./errors/ValidationError');
const FileNotFoundError = require('./errors/FileNotFoundError');
const InvalidServiceError = require('./errors/InvalidServiceError');
const ServiceExistsError = require('./errors/ServiceExistsError');

// ~~~~~~~~~~~~~~~~~~~~ CLASS ~~~~~~~~~~~~~~~~~~~~ //

class Service {
  constructor(lib) {
    // Validate input library
    if (_.isNull(lib) || _.isUndefined(lib)) {
      throw new PropertyRequiredError('library', 'Service constructor');
    } else if (!_.isObject(lib)) {
      throw new InvalidTypeError('lib', typeof lib, 'Object');
    } else if (!_.has(lib, 'id')) {
      throw new PropertyRequiredError('id', 'library');
    } else if (!_.has(lib, 'name')) {
      throw new PropertyRequiredError('name', 'library');
    } else if (!_.has(lib, 'executable')) {
      throw new PropertyRequiredError('executable', 'library');
    } else if (!_.has(lib, 'configDirectory')) {
      throw new PropertyRequiredError('configDirectory', 'library');
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
      throw new PropertyRequiredError('id');
    } else if (!_.isString(id)) {
      throw new InvalidTypeError('id', typeof id, 'string');
    } else if (id.length === 0) {
      throw new ValidationError('id should be non-empty string.');
    }
    this._id = id;
  }

  get name() {
    return this._name;
  }

  set name(name) {
    if (_.isNull(name) || _.isUndefined(name)) {
      throw new PropertyRequiredError('name');
    } else if (!_.isString(name)) {
      throw new InvalidTypeError('name', typeof name, 'string');
    } else if (name.length === 0) {
      throw new ValidationError('name should be non-empty string.');
    }
    this._name = name;
  }

  get executable() {
    return this._executable;
  }

  set executable(executable) {
    if (_.isNull(executable) || _.isUndefined(executable)) {
      throw new PropertyRequiredError('executable');
    } else if (!_.isString(executable)) {
      throw new InvalidTypeError('executable', typeof executable, 'string');
    } else if (executable.length === 0) {
      throw new ValidationError('executable should be non-empty string.');
    } else if (!shell.which(executable) || !shell.test('-ef', executable)) {
      throw new ValidationError('executable should exist or be in system path.');
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
      throw new PropertyRequiredError('configDirectory');
    } else if (!_.isString(configDirectory)) {
      throw new InvalidTypeError('configDirectory', typeof configDirectory, 'string');
    } else if (configDirectory.length === 0) {
      throw new ValidationError('configDirectory should be non-empty string.');
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
        throw new PropertyRequiredError('description');
      } else if (!_.isString(description)) {
        throw new InvalidTypeError('description', typeof description, 'string');
      } else if (description.length === 0) {
        throw new ValidationError('description should be non-empty string.');
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
        throw new PropertyRequiredError('description');
      } else if (!_.isArray(args)) {
        throw new InvalidTypeError('args', typeof args, 'Array');
      } else if (args.length === 0) {
        throw new ValidationError('args should be a non-empty array.');
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
        throw new PropertyRequiredError('log');
      } else if (!_.isObject(log)) {
        throw new InvalidTypeError('log', typeof log, 'Object');
      } else if (Object.keys(log).length === 0) {
        throw new ValidationError('log should be a non-empty object.');
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
        throw new PropertyRequiredError('serviceaccount');
      } else if (!_.isObject(serviceaccount)) {
        throw new InvalidTypeError('serviceaccount', typeof serviceaccount, 'Object');
      } else if (Object.keys(serviceaccount).length === 0) {
        throw new ValidationError('serviceaccount should be a non-empty object.');
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
    if (!isService(this.id)) {
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
      await exec(cmd, { silent: true });
      // Add username to service SDDL if present and not system admin account
      if (this.serviceaccount && this.serviceaccount.username
        && !_.includes(ADMIN_ACCOUNTS, this.serviceaccount.username)) {
        addUserToSDDL(this.id, this.serviceaccount.username);
      }
    } else if (!shell.test('-ef', this.configPath)) {
      // Create XML config file
      this.writeXmlConfigFile();
      // Test if user is added to SDDL
      if (this.serviceaccount && this.serviceaccount.username
        && !_.includes(ADMIN_ACCOUNTS, this.serviceaccount.username
          && sddlHasUserID(this.id, this.serviceaccount.username))) {
        addUserToSDDL(this.id, this.serviceaccount.username);
      }
    } else {
      throw new ServiceExistsError(this.id);
    }
  }

  async uninstall() {
    // Validate if configuration file exists
    if (!isService(this.id)) {
      throw new InvalidServiceError(this.id);
    } else if (shell.test('-ef', this.configPath)) {
      // Execute winsw with config file
      await exec(`${this.winswExec} uninstall ${this.configPath}`, { silent: true });
      // Remove config file
      shell.rm('-f', this.configPath);
    } else {
      throw new FileNotFoundError(this.configPath);
    }
  }

  async start() {
    // Validate if configuration file exists
    if (!isService(this.id)) {
      throw new InvalidServiceError(this.id);
    } else if (shell.test('-ef', this.configPath)) {
      // Execute winsw with config file
      await exec(`${this.winswExec} start ${this.configPath}`, { silent: true });
    } else {
      throw new FileNotFoundError(this.configPath);
    }
  }

  async stop() {
    // Validate if configuration file exists
    if (!isService(this.id)) {
      throw new InvalidServiceError(this.id);
    } else if (shell.test('-ef', this.configPath)) {
      // Execute winsw with config file
      await exec(`${this.winswExec} stop ${this.configPath}`, { silent: true });
    } else {
      throw new FileNotFoundError(this.configPath);
    }
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
