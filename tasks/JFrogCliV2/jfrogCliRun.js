const tl = require('azure-pipelines-task-lib/task');
const utils = require('@jfrog/tasks-utils/utils.js');
const fs = require('fs').promises;

async function runJfrogCliCommand(runTaskCbk) {
    // If no custom version requested, run with the version of the rest of the pipeline.
    if (!tl.getBoolInput('useCustomVersion')) {
        return utils.executeCliTask(runTaskCbk);
    }

    const cliVersion = tl.getInput('cliVersion', true);
    if (cliVersion.localeCompare('$(jfrogCliVersion)') === 0) {
        return utils.executeCliTask(runTaskCbk);
    }

    if (utils.compareVersions(utils.minCustomCliVersion, cliVersion) > 0) {
        throw new Error('Custom JFrog CLI Version must be at least ' + utils.minCustomCliVersion);
    }

    return utils.executeCliTask(runTaskCbk, cliVersion);
}

async function validateWorkDir(requiredWorkDir) {
    try {
        const stat = await fs.lstat(requiredWorkDir);
        if (!stat.isDirectory()) {
            throw new Error(`Provided 'Working Directory': ${requiredWorkDir} is not a directory.`);
        }
    } catch (err) {
        if (err.code === 'ENOENT') {
            throw new Error(`Provided 'Working Directory': ${requiredWorkDir} does not exist.`);
        }
        throw new Error(`Failed to access working directory '${requiredWorkDir}': ${err.message}`);
    }
}

async function runTaskCbk(cliPath) {
    const defaultWorkDir = tl.getVariable('System.DefaultWorkingDirectory');
    if (!defaultWorkDir) throw new Error('Failed getting default working directory.');

    // Determine working directory for the cli.
    const inputWorkingDirectory = tl.getInput('workingDirectory', false);
    const requiredWorkDir = utils.determineCliWorkDir(defaultWorkDir, inputWorkingDirectory);
    await validateWorkDir(requiredWorkDir);

    // Set default build name and number environment variables
    process.env.JFROG_CLI_BUILD_NAME = tl.getVariable('Build.DefinitionName');
    process.env.JFROG_CLI_BUILD_NUMBER = tl.getVariable('Build.BuildNumber');

    const serverId = utils.assembleUniqueServerId('jfrog_cli_cmd');
    await utils.configureDefaultJfrogServer(serverId, cliPath, requiredWorkDir);

    const cliCommandsList = tl.getInput('command', true).split('\n');
    for (let cliCommand of cliCommandsList) {
        cliCommand = cliCommand.trim();
        if (!cliCommand) continue; // Skip empty lines
        
        if (!cliCommand.startsWith(utils.jfrogCliToolName + ' ')) {
            throw new Error(`Unexpected JFrog CLI command prefix. Expecting the command to start with 'jf '. Received: ${cliCommand}`);
        }

        cliCommand = cliCommand.slice(utils.jfrogCliToolName.length + 1);
        cliCommand = utils.cliJoin(cliPath, cliCommand);

        if (utils.isServerIdEnvSupported()) {
            process.env.JFROG_CLI_SERVER_ID = serverId;
        } else {
            cliCommand = utils.addServerIdOption(cliCommand, serverId);
        }

        // Execute the cli command asynchronously
        await utils.executeCliCommandAsync(cliCommand, requiredWorkDir);
    }

    await utils.taskDefaultCleanup(cliPath, requiredWorkDir, [serverId]);
    return serverId;
}

// Main execution function
async function run() {
    let serverId;
    try {
        serverId = await runJfrogCliCommand(runTaskCbk);
        tl.setResult(tl.TaskResult.Succeeded, 'Command Succeeded.');
    } catch (err) {
        tl.setResult(tl.TaskResult.Failed, err.message || err);
    } finally {
        if (serverId) utils.taskDefaultCleanup(null, null, [serverId]);
    }
}

// Export functions for testing
module.exports = {
    runJfrogCliCommand,
    validateWorkDir,
    runTaskCbk,
    run
};

// Execute if this is the main module
if (require.main === module) {
    run();
}
