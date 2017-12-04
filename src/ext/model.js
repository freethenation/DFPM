import {loggers} from '../inject';

var categories = loggers
  .map((logger)=>logger.metadata)
  .filter((meta)=>meta)
categories.sort((a, b)=>(a.priority||1000)-(b.priority||1000))
categories.forEach((category)=>category.level=null) //add level to category

export class Model {
  constructor(){
    Object.assign(this, {
      events:[],
      showInfo:true,
      showWarn:true,
      showDanger:true,
      filteredCategory:null,
      categories:categories,
    })
  }
}

export function levelToInt(level){
  return ({
    'null':1,
    'info':2,
    'warning':3,
    'danger':4,
  })[level] || 0
}
