import * as cwlTsAuto from 'cwl-ts-auto'
import { createWorkflowInputParameterFromGaInput, GAInputType } from './common'
import * as path from 'path'

function generateWorkflowStepSkeleton (runName: string): cwlTsAuto.WorkflowStep {
  const workflowStepSkeleton = new cwlTsAuto.WorkflowStep({ id: 'workflow', in_: [], out: [], run: path.join('../../workflows', runName, 'workflow.cwl') })
  const outDir = 'out_dir'
  workflowStepSkeleton.out.push(outDir)
  return workflowStepSkeleton
}

function generateWorkflowStep (runName: string, gaInputs: GAInputType[]): cwlTsAuto.WorkflowStep {
  const workflowStep = generateWorkflowStepSkeleton(runName)

  for (const input of gaInputs) {
    const stepInput = new cwlTsAuto.WorkflowStepInput({})
    stepInput.id = input.name
    stepInput.source = input.name
    workflowStep.in_.push(stepInput)
  }
  return workflowStep
}

function generateRunSkeleton (): cwlTsAuto.Workflow {
  const run = new cwlTsAuto.Workflow({
    cwlVersion: cwlTsAuto.CWLVersion.V1_2,
    requirements: [new cwlTsAuto.MultipleInputFeatureRequirement({}), new cwlTsAuto.SubworkflowFeatureRequirement({})],
    inputs: [],
    outputs: [],
    steps: []
  })
  const output = new cwlTsAuto.WorkflowOutputParameter({ type: cwlTsAuto.CWLType.DIRECTORY, id: 'out_dir', outputSource: 'workflow/out_dir' })
  run.outputs.push(output)
  return run
}

export function generateRun (runName: string, gaInputs: GAInputType[]): cwlTsAuto.Workflow {
  const run = generateRunSkeleton()

  for (const input of gaInputs) {
    run.inputs.push(createWorkflowInputParameterFromGaInput(input))
  }

  const workflowStep = generateWorkflowStep(runName, gaInputs)
  run.steps.push(workflowStep)
  return run
}
