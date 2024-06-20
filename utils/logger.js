// @ts-check
import chalk from "chalk"

export default {
    /**
     * @param {string} label 
     * @param  {...string} messages 
     */
    success(label, ...messages) {
        messages.length > 0 ? process.stdout.write(label + chalk.green(...messages) + "\r\n") : process.stdout.write(chalk.green(label) + "\r\n")
    },
    /**
     * @param {string} label 
     * @param  {...string} messages 
     */
    error(label, ...messages) {
        messages.length > 0 ? process.stdout.write(label + chalk.red(...messages) + "\r\n") : process.stdout.write(chalk.red(label) + "\r\n")
    },
    /**
     * @param {string} label 
     * @param  {...string} messages 
     */
    info(label, ...messages) {
        messages.length > 0 ? process.stdout.write(label + chalk.cyan(...messages) + "\r\n") : process.stdout.write(chalk.cyan(label) + "\r\n")
    },
    /**
     * @param {string} label 
     * @param  {...string} messages 
     */
    warn(label, ...messages) {
        messages.length > 0 ? process.stdout.write(label + chalk.yellow(...messages) + "\r\n") : process.stdout.write(chalk.yellow(label) + "\r\n")
    },
    /**
     * @param {string} label 
     * @param  {...string} messages 
     */
    debug(label, ...messages) {
        messages.length > 0 ? process.stdout.write(label + chalk.gray(...messages) + "\r\n") : process.stdout.write(chalk.gray(label) + "\r\n")
    }
}