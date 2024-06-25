#!/usr/bin/env node
// @ts-check
import { program } from "commander"
import { createRequire } from "node:module"

const require = createRequire(import.meta.url)

const pkg = require("./package.json")

program
.name(pkg.name)
.description(pkg.description)
.version(pkg.version)
.executableDir("sub-cmds")
.command("fetch", "get swagger api doc content")
.command("model", "just only generate typescript model file")
.parse()