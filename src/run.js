import {parse} from './SynctaxParser.js'
import {Evaluator} from './evaluator.js'

document.getElementById('btn').addEventListener('click', (event) => {
  const r = new Evaluator().evaluate(parse(document.getElementById("sourceInp").value))
  console.log(r)
})
