/* description: Argdown 2 Grammar with AST-building actions.*/
/* author: Christian Voigt */

%{
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

('**'|'__')					%{ return 'STRONG'; %}
('*'|'_')					%{return 'EM'; %}

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
			name:"title-definition",
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
'@'(\w+)':'(\d+)' '* 						%{ 
		var text = yytext;
		yytext = {
			name:"id",
			username:yy.lexer.matches[1],
			statementNr: yy.lexer.matches[2],
			text: text
		};
		return 'ID'; 
	%}
'@'(\S+) 						%{ 
	var text = yytext;
	yytext = {
		name:"user",
		username:yy.lexer.matches[1],
		text:text
	};
	return 'USER'; 
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
'though:'			%{ this.begin('INITIAL'); return 'CONTRA'; %}

<indented>'-'		%{ this.popState(); return 'CONTRA'; %}
<indented>'+'		%{ this.popState(); return 'PRO'; %}


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

		if(whatAmI.name === "reason"){
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
	| NEWLINE reason %prec TAB { $$ = [$1,$2];}
	;
reason
	: optionalTabs relation statement %prec PRO {
		$$ = {name:"reason", indent:$1.indent};
		addChildren($$,[$1,$2,$3]);
	}	
	| optionalTabs relation error %prec TAB{
		yy.errors = true;
		$$ = {name:"reason", indent:$1.indent};
		addChildren($$,[$1,$2]);
	}
	| tabs statement error %prec SPACE{
		yy.errors = true;
		$$ = {name:"reason", indent:$1.indent};
		addChildren($$,[$1,$2]);	
	}
	| tabs error %prec CHAR{
		yy.errors = true;
		$$ = {name:"reason", indent:$1.indent};
		addChildren($$,[$1]);
	}
	;
relation
	: PRO {$$ = {name:"relation", text:$1, type:"pro", direction:"to"};}
	| CONTRA {$$ = {name:"relation", text:$1, type:"contra", direction:"to"};}
	| PRO-OUT {$$ = {name:"relation", text:$1, type:"pro", direction:"from"};}
	| CONTRA-OUT  {$$ = {name:"relation", text:$1, type:"contra", direction:"from"};}
	;	
statement
	: statementElements %prec CHAR {
			$$ = createNode("statement");
			addChildren($$,$1);
		}
	| DEFINITION statementElements %prec PRO {
			$$ = createNode("statement");
			addChildren($$,[{name:"title-definition", text:$1, title:extractTitle($1)}]);	
			addChildren($$,$2);
	}
	| DEFINITION error %prec SPACE {
			$$ = createNode("statement");
			addChildren($$,[{name:"title-definition", text:$1, title:extractTitle($1)}]);	
			yy.errors = true;
	}
	;	
statementElements
	: statementElements statementElement %prec CHAR {$$ = $1; $$.push($2); }
	| statementElement %prec CHAR { $$ = [$1];}
	;
statementElement
	: TITLE %prec PRO 
	| ID %prec PRO
	| LINK %prec PRO
	| TAG %prec PRO 
	| USER %prec PRO 
	| text
	| EM { $$ = {name:"em", text:$1};}
	| STRONG { $$ = {name:"strong", text:$1};}
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