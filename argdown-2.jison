/* description: Argdown 2 Grammar with AST-building actions.*/
/* author: Christian Voigt */

%{
	var tagStack = [];
	var resetTagStack = function(){
		tagStack = [];
	};
	var checkTagStack = function(current){
		var last = tagStack[tagStack.length-1];
		if(last && last.tagName === current.tagName && last.tagType !== current.tagType){
			current.isComplete = true;
			last.isComplete = true;
			tagStack.pop();
		}else{
			tagStack.push(current);
		}
	}
	var createNode = function(name){
		return {name:name, children:[]};
	};
	var createTitleNode = function(str){
		return {name:"title", text:str, title:extractTitle(str)};
	};
	var addChildren = function(parent,children){
		if(!parent.children) parent.children = [];
		Array.prototype.push.apply(parent.children, children);
		for(var i = 0; i<children.length; i++){
			children[i].parent = parent;
		}
	};
	var prevLevel = 0;
	var prevNode;

	var root = {children:[], name:"thesis"};
	var createNewRoot = function(statement){
		root = {children:[], name:"thesis"};
		root.children.push(statement);
	 	prevLevel = 0;
	 	prevNode = null;
	 	return root;
	}
	var addChildToGraph = function(node){
		var level = node.indent;

		if(prevNode == null) {
			node.parent = root;
			root.children.push(node);
		}else if(level > prevLevel){
			node.parent = prevNode;
			prevNode.children = prevNode.children || [];
			prevNode.children.push(node);
		}else if(level < prevLevel){
			var parent = prevNode.parent;
			while(level < prevLevel && parent.parent){
				parent = parent.parent;
				prevLevel--;
			}
			node.parent = parent;
			parent.children.push(node);
		}else if(level == prevLevel){
			node.parent = prevNode.parent;
			prevNode.parent.children.push(node); 
		}

		prevLevel = level;
		prevNode = node;

		return root;
	}
%}

/* lexical grammar */
%lex

%s indented
%s user
%s title
%s strong1
%s strong2
%s em1
%s em2

%%
<<EOF>>						%{ this.begin('INITIAL'); return 'EOF'; %}

[\n\r]+	 							%{ 
	var text = yytext;
	yytext = {
		text:text,
		name:"newline"
	};
	this.begin('indented'); 
	return 'NEWLINE'; 
%}
<indented>("   ")								%{ return 'TAB'; %}
<indented>(\t)								%{ return 'TAB'; %}

'thus+'				%{ this.begin('INITIAL'); return 'PRO-OUT'; %}
'>+'				%{ this.begin('INITIAL'); return 'PRO-OUT'; %}
'->+'				%{ this.begin('INITIAL'); return 'PRO-OUT'; %}
'thus-'				%{ this.begin('INITIAL'); return 'CONTRA-OUT'; %}
'>-'				%{ this.begin('INITIAL'); return 'CONTRA-OUT'; %}
'->-'				%{ this.begin('INITIAL'); return 'CONTRA-OUT'; %}


'+because' 			%{ this.begin('INITIAL'); return 'PRO'; %}
'+<-'				%{ this.begin('INITIAL'); return 'PRO'; %}
'+<'				%{ this.begin('INITIAL'); return 'PRO'; %}
'-because'			%{ this.begin('INITIAL'); return 'CONTRA'; %}
'-<-'				%{ this.begin('INITIAL'); return 'CONTRA'; %}
'-<'				%{ this.begin('INITIAL'); return 'CONTRA'; %}
'pro:'				%{ this.begin('INITIAL'); return 'PRO'; %}
'contra:'			%{ this.begin('INITIAL'); return 'CONTRA'; %}

'comment:'			%{ this.begin('INITIAL'); return 'COMMENT'; %}


<indented>'-'		%{ this.popState(); return 'CONTRA'; %}
<indented>'+'		%{ this.popState(); return 'PRO'; %}
<indented>'*'		%{ this.popState(); return 'COMMENT'; %}

'['(.+)']'' '?'('(('http'|'https'|'mailto'|'ftp')'://'.+)\s+('\''(.+)'\''|'"'(.+)'"')?')'			%{ 
		var text = yytext;
		yytext = {
			name:"link",
			text:text,
			label:yy.lexer.matches[1],
			url:yy.lexer.matches[2],
			title:(yy.lexer.matches[4])? yy.lexer.matches[4]:yy.lexer.matches[2]
		}
		return 'LINK'; 
		%}
('http'|'https'|'mailto'|'ftp')'://'\S* 	%{ 
	var text = yytext;
	yytext = {
		name:"link",
		text:text,
		url:yy.lexer.matches[1]
	}
	return 'LINK'; 
%}

' '*'['(.+)']:'				%{ 
		var text = yytext;
		yytext = {
			name:"definition",
			title:yy.lexer.matches[1],
			text: text
		}; 
		return 'DEFINITION'; 
	%}
'['(.+)']' 				%{ 
		var text = yytext;
		yytext = {
			name:"title",
			title:yy.lexer.matches[1],
			text: text
		};
		return 'TITLE'; 
	%}
'@'(\w+)('/s/'|'/r/')(\d+) 						%{ 
		var text = yytext;
		yytext = {
			name:"reference",
			username:yy.lexer.matches[1],
			itemType: (yy.lexer.matches[2] === "/s/")? "statement": "relation",
			itemNr: yy.lexer.matches[3],
			reference:"@"+yy.lexer.matches[1]+yy.lexer.matches[2]+yy.lexer.matches[3],
			text: text
		};
		return 'REFERENCE'; 
	%}
'@'(\w+)('/')(\S*)			%{ 
		var text = yytext;
		var itemType;
		if(yy.lexer.matches[3] === "s/")
			itemType = "statement";
		else if(yy.lexer.matches[3] === "r/")
			itemType = "relation";

		yytext = {
			name:"reference",
			username:yy.lexer.matches[1],
			itemType: itemType,
			reference:"@"+yy.lexer.matches[1]+yy.lexer.matches[2],
			text: text
		};
		return 'REFERENCE'; 
	%}
'@'(\w+) 						%{ 
	var text = yytext;
	yytext = {
		name:"reference",
		username:yy.lexer.matches[1],
		text:text
	};
	return 'REFERENCE'; 
	%}
('@')						%{
	var text = yytext;
	yytext = {
		name:"reference",
		text:text,
		username:""
	}
	return 'REFERENCE';
%}	
'#'(\S+)					%{ 
	var text = yytext;
	yytext = {
		name:"tag",
		text:text,
		tag:yy.lexer.matches[1]
	}
	return 'TAG'; 
	%}
('#')						%{
	var text = yytext;
	yytext = {
		name:"tag",
		text:text,
		tag:""
	}
	return 'TAG';
%}

<strong1>(\*\*)				%{ this.popState(); return 'STRONG1_END'; %}
(\*\*)						%{ this.begin('strong1'); return 'STRONG1_START'; %}
<strong2>(__)					%{ this.popState(); return 'STRONG2_END'; %}
(__)							%{ this.begin('strong2'); return 'STRONG2_START'; %}
<em1>(\*)						%{ this.popState(); return 'EM1_END'; %}
(\*)							%{ this.begin('em1'); return 'EM1_START'; %}
<em2>(_)						%{ this.popState(); return 'EM2_END'; %}
(_)							%{ this.begin('em2'); return 'EM2_START'; %}


' '+				%{ return 'SPACE'; %}
.					%{ return 'CHAR'; %} /* if we use .+ here, no SPACE will be found. (Don't know why.) */


/lex
	%left CHAR
	%left SPACE TITLE
	%left TAB
	%left PRO CONTRA PRO-OUT CONTRA-OUT

%start start

%% /* language grammar */
start
	: optionalNewline message optionalNewline EOF {
		var result = [];
		if($1.text !== "")result.push($1);
		Array.prototype.push.apply(result,$2);
		if($3.text !== "")result.push($3);
		return result;}
	| optionalNewline EOF { var result = []; if($1.text !== "")result.push($1); return result;}
	;
optionalNewline
	: /**/{$$={name:"newline", text:""};}
	| NEWLINE {$$ = $1;}
	;
message
	: message statementOrReason {
		var newline = $2[0];
		var whatAmI = $2[1];

		if(whatAmI.name === "reason" || whatAmI.name === "comment"){
			$$ = $1;
			newline.indent = whatAmI.indent;
			addChildToGraph(newline);
			addChildToGraph(whatAmI);
		}else if(whatAmI.name === "statement"){
			$$ = $1;
			$$.push(newline);			
			$$.push(createNewRoot(whatAmI));
		} 
	}
	| statement {
		$$ = [createNewRoot($1)];
	}
	;
statementOrReason
	: NEWLINE statement %prec PRO {	
	$$ = [$1,$2];
	}
	| NEWLINE reasonOrComment %prec TAB { $$ = [$1,$2];}
	;
reasonOrComment
	: optionalTabs relation statement %prec PRO {
		$$ = {indent:$1.indent};
		if($2.type === "comment")$$.name = "comment";
		else $$.name = "reason";
		addChildren($$,[$1,$2,$3]);
	}	
	| optionalTabs relation error %prec TAB{
		yy.errors = true;
		$$ = {indent:$1.indent};
		if($2.type === "comment")$$.name = "comment";
		else $$.name = "reason";
		addChildren($$,[$1,$2]);
	}
	| tabs statement error %prec SPACE{
		yy.errors = true;
		$$ = {name:"comment", indent:$1.indent};
		addChildren($$,[$1,$2]);	
	}
	| tabs error %prec CHAR{
		yy.errors = true;
		$$ = {name:"comment", indent:$1.indent};
		addChildren($$,[$1]);
	}
	;
relation
	: PRO {$$ = {name:"relation", text:$1, type:"pro", direction:"to-left"};}
	| CONTRA {$$ = {name:"relation", text:$1, type:"contra", direction:"to-left"};}
	| PRO-OUT {$$ = {name:"relation", text:$1, type:"pro", direction:"to-right"};}
	| CONTRA-OUT  {$$ = {name:"relation", text:$1, type:"contra", direction:"to-right"};}
	| COMMENT  {$$ = {name:"relation", text:$1, type:"comment", direction:"to-left"};}
	;	
statement
	: statementElements %prec CHAR {
			$$ = createNode("statement");
			addChildren($$,$1);
			resetTagStack();
		}
	| DEFINITION statementElements %prec PRO {
			$$ = createNode("statement");
			addChildren($$,[$1]);	
			addChildren($$,$2);
			resetTagStack();
	}
	| DEFINITION error %prec SPACE {
			$$ = createNode("statement");
			addChildren($$,[$1]);	
			yy.errors = true;
			resetTagStack();
	}
	| statementElements DEFINITION statementElements error %prec SPACE{
			$$ = createNode("statement");
			addChildren($$,[$1]);	
			addChildren($$,[$2]);	
			addChildren($$,[$3]);	
			yy.errors = true;
			resetTagStack();	
	}
	| statementElements DEFINITION error %prec SPACE{
			$$ = createNode("statement");
			addChildren($$,[$1]);	
			addChildren($$,[$2]);	
			yy.errors = true;
			resetTagStack();	
	}
	;	
statementElements
	: statementElements statementElement %prec CHAR {$$ = $1; $$.push($2); }
	| statementElement %prec CHAR { $$ = [$1];}
	;
statementElement
	: TITLE %prec PRO 
	| REFERENCE %prec PRO
	| LINK %prec PRO
	| TAG %prec PRO 
	| text
	| EM1_START { $$ = {name:"em1-start", tagName:"em1", tagType:"start", text:$1}; checkTagStack($$);}
	| EM1_END { $$ = {name:"em1-end", tagName:"em1", tagType:"end", text:$1}; checkTagStack($$);}
	| EM2_START { $$ = {name:"em2-start", tagName:"em2", tagType:"start", text:$1}; checkTagStack($$);}
	| EM2_END { $$ = {name:"em2-end", tagName:"em2", tagType:"end", text:$1}; checkTagStack($$);}
	| STRONG1_START { $$ = {name:"strong1-start", tagName:"strong1", tagType:"start", text:$1}; checkTagStack($$);}
	| STRONG1_END { $$ = {name:"strong1-end", tagName:"strong1", tagType:"end", text:$1}; checkTagStack($$);}
	| STRONG2_START { $$ = {name:"strong2-start", tagName:"strong2", tagType:"start", text:$1}; checkTagStack($$);}
	| STRONG2_END { $$ = {name:"strong2-end", tagName:"strong2", tagType:"end", text:$1}; checkTagStack($$);}
	;
text
	: text charOrSpace {$1.text += $2; $$ = $1;}
	| charOrSpace {$$= {name:"text", text:$1};}
	;	
charOrSpace
	: CHAR %prec PRO
	| SPACE %prec PRO
	;
optionalTabs
	: /**/ %prec TAB {$$ = {name:"tabs", text:"", indent:0};}
	| tabs %prec PRO {$$ = $1;}
	;
tabs
	: tabs TAB %prec PRO {$$=$1; $$.indent++; $$.text = $$.text +$2;}
	| TAB optionalSpace %prec TAB {$$ = {name:"tabs", text:$1+$2, indent:1};}
	;
optionalSpace
	: /*empty*/ %prec PRO {$$ = "";}
	| SPACE %prec PRO {$$ = $1;}
	;			