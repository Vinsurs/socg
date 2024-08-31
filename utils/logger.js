// @ts-check
import chalk from "chalk"
import { eolChar } from "./helper"

export default {
    /**
     * @param {string} label 
     * @param  {...string} messages 
     */
    success(label, ...messages) {
        messages.length > 0 ? process.stdout.write(label + chalk.green(...messages) + eolChar) : process.stdout.write(chalk.green(label) + eolChar)
    },
    /**
     * @param {string} label 
     * @param  {...string} messages 
     */
    error(label, ...messages) {
        messages.length > 0 ? process.stdout.write(label + chalk.red(...messages) + eolChar) : process.stdout.write(chalk.red(label) + eolChar)
    },
    /**
     * @param {string} label 
     * @param  {...string} messages 
     */
    info(label, ...messages) {
        messages.length > 0 ? process.stdout.write(label + chalk.cyan(...messages) + eolChar) : process.stdout.write(chalk.cyan(label) + eolChar)
    },
    /**
     * @param {string} label 
     * @param  {...string} messages 
     */
    warn(label, ...messages) {
        messages.length > 0 ? process.stdout.write(label + chalk.yellow(...messages) + eolChar) : process.stdout.write(chalk.yellow(label) + eolChar)
    },
    /**
     * @param {string} label 
     * @param  {...string} messages 
     */
    debug(label, ...messages) {
        messages.length > 0 ? process.stdout.write(label + chalk.gray(...messages) + eolChar) : process.stdout.write(chalk.gray(label) + eolChar)
    }
}