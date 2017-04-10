global.supertest = require("supertest");
global.should = require("should");
global.assert = require("assert");
global.chalk = require("chalk");
global.config = require(__dirname + '/../../../.config/server/index')['development'];
global.path = require("path");
global.models = require("../../models/index");

// This agent refers to PORT where program is running.

global.server = supertest.agent("http://172.20.0.3:8080");
