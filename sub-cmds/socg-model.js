import { createCommand } from "commander"
import fse from "fs-extra"
import { pathResolve } from "../utils/path.js"
import { handleSchemas, preHandleSchemas } from "../utils/swagger.js"
import logger from "../utils/logger.js"

const program = createCommand()

program
.argument("<url>", "swagger json online url")
.requiredOption("-o, --output <path>", "the path in where the generated model file will be saved")
.action(async function (url, options) {
    const outputPath = pathResolve(void 0, options.output)
    try {
        const swaggerJson = await preHandleSchemas(url)
        logger.info("start generating model file...")
        const schemaCode = handleSchemas(swaggerJson, outputPath)
        fse.writeFileSync(outputPath, schemaCode)
        logger.success("model file generated successfully in path ", outputPath)
    } catch (error) {
        logger.warn(error.message)
        process.exit(1)
    }
})
.parseAsync()