#! /usr/bin/env node
import * as fs from 'fs'
import { extractGaInputsFromGaFile, writeOutput } from './common'
import { generatePreprocessingTool } from './preprocessingTool'
import commandLineArgs from 'command-line-args'
import commandLineUsage from 'command-line-usage'
import * as path from 'path'
import { generateWorkflow } from './workflow'
import * as cwlTsAuto from 'cwl-ts-auto'

const optionDefinitions = [
  { name: 'workflowFile', alias: 'i', type: String, defaultOption: true, description: 'Path to the Galaxy workflow file to process' },
  { name: 'outFolder', alias: 'o', type: String, defaultValue: './out', description: 'Path to place the results in (default: ./out)' },
  { name: 'help', alias: 'h', type: Boolean, description: 'Prints this dialogue' }
]

const sections = [
  {
    header: 'Galaxy Workflow to Delegation Workflow',
    content: 'Generates a CWL delegation workflow from a Galaxy workflow(.ga) file'
  },
  {
    header: 'Options',
    optionList: optionDefinitions
  }
]

function main (): void {
  const usage = commandLineUsage(sections)
  const options = commandLineArgs(optionDefinitions)

  if (options.help === true) {
    console.log(usage)
    return
  }

  if (options.workflowFile == null) {
    console.log('Please specify a workflow file')
    return
  }

  try {
    // Read the Galaxy workflow file
    const gaWorkflowJson = JSON.parse(fs.readFileSync(options.workflowFile).toString())

    // Extract the input descriptions from the Galaxy workflow file
    const gaInputs = extractGaInputsFromGaFile(gaWorkflowJson)

    // Generate the preprocessing cwl tool using the Galaxy input descriptions
    const preprocessingTool = generatePreprocessingTool(gaInputs)
    cwlTsAuto.loadDocument(path.join(__dirname, 'data/tools/planemo-run.cwl')).then((planemoTool) => {
      planemoTool = planemoTool as cwlTsAuto.CommandLineTool

      const workflow = generateWorkflow(preprocessingTool, planemoTool, gaInputs)

      writeOutput(options.outFolder, workflow, options.workflowFile)
    }).catch((e) => {
      throw e
    })
  } catch (e) {
    if (e instanceof cwlTsAuto.ValidationException) {
      console.log(e.toString())
    } else {
      console.log(e)
    }
  }
}

main()
