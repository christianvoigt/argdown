import * as _ from 'lodash';
var builder = require('xmlbuilder');
var Chance = require('chance');
var chance = new Chance();

class ArgMLExport{
  set config(config){
    this.settings = _.defaults(config ||{}, {
      useHtmlLabels : false,
      onlyTitlesInHtmlLabels: false,
      graphname: 'Argument Map',
    });
  }
  constructor(){
    this.name = "ArgMLExport";
  }
  run(data){
    let argml = builder.create('graphml',{version: '1.0', encoding: 'UTF-8', standalone: true})
      .a('xmlns' , 'http://graphml.graphdrawing.org/xmlns')
      .a('xmlns:arg' , 'xmlns:arg="http://www.argunet.org/xml/argml')
      .a('xmlns:xsi' , 'http://www.w3.org/2001/XMLSchema-instance')
      .a('xmlns:y'  , 'http://www.yworks.com/xml/graphml')
      .a('xsi:schemaLocation' , 'http://www.argunet.org/xml/argml argunetxml.xsd http://graphml.graphdrawing.org/xmlns http://www.yworks.com/xml/schema/graphml/1.1/ygraphml.xsd');

      argml.e('key',{
        'attr.name' :  'arg.debate',
        'id' : 'd0'
      });
      argml.e('key',{
        'for' : 'graphml',
        'yfiles.type' :  'resources',
        'id' : 'd1'
      });
      argml.e('key',{
        'attr.name' :  'arg.node',
        'for' : 'node',
        'id' : 'd2'
      });
      argml.e('key',{
        'for' : 'node',
        'yfiles.type' :  'nodegraphics',
        'id' : 'd3'
      });
      argml.e('key',{
        'attr.name' : 'arg.edge',
        'for' :  'edge',
        'id' : 'd4'
      });
      argml.e('key',{
        'for' : 'edge',
        'yfiles.type' :  'edgegraphics',
        'id' : 'd5'
      });

    let graph = argml.e('graph', {
      'edgedefault' : 'directed',
      'id' : 'G'
    });

    let statementArgMLIds = {};

    for(let node of data.map.nodes){
      node.argmlId = this.getId();
      let nodeEl = graph.e('node',{id: node.id}).e('data',{'key':'d2'});
      if(node.type == "statement"){
        let statement = data.statements[node.title];
        let thesisEl = nodeEl.e('arg:thesis',{'id':node.argmlId, 'colorIndex':'0'}).e('arg:title', null, statement.title).up();
        let lastMember = _.last(statement.members);
        thesisEl.e('arg:content', null, lastMember.text);

        // //yworks
        // nodeEl.e('data', {'key':'d3'}).e('y:ShapeNode')
        //   .e('y:Geometry')
      }else if(node.type == "argument"){
        let argument = data.arguments[node.title];
        let lastDescriptionStatement = _.last(argument.descriptions.members);
        let description = (lastDescriptionStatement)?lastDescriptionStatement.text : "";
        let argEl = nodeEl.e('arg:argument',{
          'id' : node.argmlId,
          'colorIndex' : '0',
        }).e('arg:title',null,argument.title).up();
        argEl.e('arg:description', null, description);
        for(let i = 0; i < argument.pcs.length; i++){
          let statement = argument.pcs[i];
          let lastMember = _.last(statement.members);
          let propositionType = 'premise';
          let id = this.getId();
          statementArgMLIds[statement.title] = id;
          if(statement.role == 'conclusion'){
            if(i == argument.pcs.length - 1){
              propositionType = 'conclusion';
            }else{
              propositionType = 'preliminaryConclusion';
            }
          }
          argEl.e('arg:proposition',{
            'id' : id,
            'type' : propositionType
          }).e('arg:content', null, lastMember.text);
        }
      }
    }

    for(let edge of data.map.edges){
      let edgeEl = graph.e('edge',{id:edge.id, source:edge.from.id, target:edge.to.id});
      let edgeType = edge.type;
      if(!edge.toStatement ||!edge.fromStatement){
        if(edgeType == "attack")
          edgeType == "sketchedAttack";
        else if(edgeType == "support")
          edgeType == "sketchedSupport";
      }
      let argEdgeAttributes = {
        'sourceNodeId': edge.from.argmlId,
        'targetNodeId': edge.to.argmlId
      };
      if(edge.fromStatement){
        argEdgeAttributes.sourcePropositionId = statementArgMLIds[edge.fromStatement.title];
      }
      if(edge.toStatement){
        argEdgeAttributes.targetPropositionId = statementArgMLIds[edge.toStatement.title];
      }
      edgeEl.e('data',{'key':'d4'}).e('arg:edge',argEdgeAttributes);
    }
    data.argml = argml;
    return data;
  }
  getId(){
    return chance.natural({min:0, max:9223372036854775807}); //positive long value
  }
}
module.exports = {
  ArgMLExport: ArgMLExport
}
