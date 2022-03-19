import * as cwlTsAuto from 'cwl-ts-auto'
import { createWorkflowInputParameterFromGaInput, GAInputType } from './common'

function generatePreprocessingStepSkeleton (preprocessingTool: cwlTsAuto.CommandLineTool): cwlTsAuto.WorkflowStep {
  const preprocessingStepSkeleton = new cwlTsAuto.WorkflowStep({ id: 'preprocessing', in_: [], out: [], run: preprocessingTool })
  const outParamFile = 'paramFile'
  const outInputDataFolder = 'inputDataFolder'
  preprocessingStepSkeleton.out.push(outParamFile, outInputDataFolder)
  return preprocessingStepSkeleton
}

function generatePreprocessingStep (preprocessingTool: cwlTsAuto.CommandLineTool, gaInputs: GAInputType[]): cwlTsAuto.WorkflowStep {
  const preprocessingStep = generatePreprocessingStepSkeleton(preprocessingTool)
  for (const input of gaInputs) {
    const stepInput = new cwlTsAuto.WorkflowStepInput({})
    stepInput.id = input.name
    stepInput.source = input.name
    preprocessingStep.in_.push(stepInput)
  }
  return preprocessingStep
}

function generatePlanemoStep (planemoTool: cwlTsAuto.CommandLineTool): cwlTsAuto.WorkflowStep {
  const planemoStep = new cwlTsAuto.WorkflowStep({ id: 'planemo', in_: [], out: [], run: planemoTool })
  const workflowInputParams = new cwlTsAuto.WorkflowStepInput({ id: 'workflowInputParams', source: 'preprocessing/paramFile' })
  const inputDataFolder = new cwlTsAuto.WorkflowStepInput({ id: 'inputDataFolder', source: 'preprocessing/inputDataFolder' })
  planemoStep.in_.push(workflowInputParams, inputDataFolder)

  const outDir = 'out_dir'
  planemoStep.out.push(outDir)
  return planemoStep
}

function generateRunSkeleton (): cwlTsAuto.Workflow {
  const run = new cwlTsAuto.Workflow({
    cwlVersion: cwlTsAuto.CWLVersion.V1_2,
    requirements: [new cwlTsAuto.MultipleInputFeatureRequirement({})],
    inputs: [],
    outputs: [],
    steps: []
  })
  const output = new cwlTsAuto.WorkflowOutputParameter({ type: cwlTsAuto.CWLType.DIRECTORY, id: 'out_dir', outputSource: 'planemo/out_dir' })
  run.outputs.push(output)
  return run
}

export function generateWorkflow (preprocessingTool: cwlTsAuto.CommandLineTool, planemoTool: cwlTsAuto.CommandLineTool, gaInputs: GAInputType[]): cwlTsAuto.Workflow {
  const run = generateRunSkeleton()

  for (const input of gaInputs) {
    run.inputs.push(createWorkflowInputParameterFromGaInput(input))
  }

  const preprocessingStep = generatePreprocessingStep(preprocessingTool, gaInputs)
  const planemoStep = generatePlanemoStep(planemoTool)
  run.steps.push(preprocessingStep)
  run.steps.push(planemoStep)
  return run
}
