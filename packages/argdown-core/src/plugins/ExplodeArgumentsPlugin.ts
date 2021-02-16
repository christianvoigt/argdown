import { IArgdownPlugin, IRequestHandler } from "../IArgdownPlugin";
import { ArgdownPluginError, IArgdownRequest, IArgdownResponse } from "..";
import { checkResponseFields } from "../ArgdownPluginError";
import { isObject } from "../utils";
import { IArgument, IConclusion, IPCSStatement, StatementRole } from "../model/model";

export class ExplodeArgumentsPlugin implements IArgdownPlugin {
  name = "ExplodeArgumentsPlugin";
  getSettings(request: IArgdownRequest) {
    if (isObject(request.model)) {
      return request.model;
    } else {
      request.model = {};
      return request.model;
    }
  }
  run: IRequestHandler = (request, response) => {
    const requiredResponseFields: string[] = ["arguments", "statements"];
    checkResponseFields(this, response, requiredResponseFields);
    let { explodeArguments } = this.getSettings(request);
    if(explodeArguments){
        for(let title of Object.keys(response.arguments!)){
                this.explodeArgument(response, response.arguments![title]);
        }
    }
    return response;
  }
  explodeArgument(response:IArgdownResponse, argument:IArgument){
    const steps:IPCSStatement[][] = argument.pcs.reduce((prev, curr, index)=>{
        if(curr.role == StatementRole.INTERMEDIARY_CONCLUSION || curr.role == StatementRole.MAIN_CONCLUSION){
          const step:IPCSStatement[] = this.getInferentialStep(response, argument, curr as IConclusion, index);
          prev.push(step);
        }
        return prev;
      }, [] as IPCSStatement[][]);
    if(steps.length <= 1){
      return;
    }
    const newArguments:IArgument[] = steps.map((step, stepIndex)=>{
      const title = `${argument.title} - ${stepIndex + 1}`;
      return {...argument, pcs: step.map(s=>{
        s.argumentTitle = title;
        return s;
      }), title, relations:[]} as IArgument;
    });
    const last = newArguments[newArguments.length -1];
    last.relations = [...argument.relations!.map(r=>{
      if(r.from == argument){
        r.from = last;
      }else{
        r.to = last;
      }
      return r;
    })];
    delete response.arguments![argument.title!];
    for(let newArgument of newArguments){
      if(response.arguments![newArgument.title!]){
        throw new ArgdownPluginError(this.name, "argument-already-exists", `Can not create argument '${newArgument.title}'. An argument with that title already exists.`);
      }
      response.arguments![newArgument.title!] = newArgument;
    }
  }
  getInferentialStep(response:IArgdownResponse, argument:IArgument, conclusion: IConclusion, index:number){
    let uses:number[]|null = null;
    if(conclusion.inference && conclusion.inference.data && conclusion.inference.data["uses"] && Array.isArray(conclusion.inference.data["uses"])){
      uses = conclusion.inference.data["uses"];
    }else if(conclusion.data && conclusion.data["uses"] && Array.isArray(conclusion.data["uses"])){
      uses = conclusion.data.uses;
    }
    let step:IPCSStatement[]
    if(uses != null){
      step = uses.map((i)=>{
        const zeroI = i - 1;
        if(!Number.isInteger(zeroI) && zeroI < 0 || zeroI > argument.pcs.length){
          throw new ArgdownPluginError(this.name, "invalid-data",`'uses' list for statement ${index} of argument ${argument.title} contains invalid statement index: ${i}`);
        }
        const pcsStatement:IPCSStatement = {...argument.pcs[zeroI], role: StatementRole.PREMISE};
        this.substituteStatementInEquivalenceClass(response, argument.pcs[zeroI], pcsStatement);
        return pcsStatement;
      })
    }else{
      step = [];
      for(let i = index - 1; i >= 0; i--){
        const statement = argument.pcs[i];
        const newStatement:IPCSStatement = {...statement, role: StatementRole.PREMISE};
        step.push(newStatement);
        this.substituteStatementInEquivalenceClass(response, statement, newStatement);
        if(statement.role == StatementRole.INTERMEDIARY_CONCLUSION){
          break;
        }
      }
      step.reverse();
    }
    step.push(conclusion);
    return step;
  }
  substituteStatementInEquivalenceClass(response:IArgdownResponse, oldStatement:IPCSStatement, newStatement:IPCSStatement){
    const ec = response.statements![newStatement.title!];
    const index = ec.members.findIndex((m)=>m == oldStatement);
    if(index != -1){
      ec.members.splice(index, 1);
    }
    ec.members.push(newStatement);
  }
}
