/* description: Argdown Grammar with AST-building actions.*/
/* author: Christian Voigt */

%{
	var extractID = function(str){
		return str.substring(str.indexOf("@")+1).replace(" ","");
	};
	var extractUser = function(str){
		return str.substring(str.indexOf("@")+1,str.indexOf(":")).replace(" ","");
	};
	var extractTitle = function(str){
		return str.substring(str.indexOf("[")+1, str.indexOf("]"));
	};
	var createNode = function(name){
		return {name:name, children:[]};
	};
	var createTitleNode = function(str){
		return {name:"title", text:str, title:extractTitle(str)};
	};
	var addChildren = function(parent,children){
		parent.children = children;
		for(var i = 0; i<children.length; i++){
			children[i].parent = parent;
		}
	};
	var prevLevel = 0;
	var prevNode;

	var root = {children:[], name:"graph"};
	var addChildToGraph = function(node, reset){
		if(reset){
			root = {children:[{}], name:"graph"};
		 	prevLevel = 0;
		 	prevNode = null;
		}
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

%%
\s*<<EOF>>						%{ this.begin('INITIAL'); return 'EOF'; %}

((\r(\s)*\r(\s)*)|(\n(\s)*\n(\s)*)|((\r\n)(\s)*(\r\n)(\s)*))	%{ this.begin('indented'); return 'EMPTYLINE'; %}
(\s)*[\n\r]+	 							%{ this.begin('indented'); return 'NEWLINE'; %}
("   ")								%{ this.begin('indented'); return 'TAB'; %}
(\t)								%{ this.begin('indented'); return 'TAB'; %}

(' '*'['(.)+']'' '*) 				%{ return 'TITLE'; %}
' '*'@'\w+':' 						%{ this.begin('user'); return 'USER'; %}
<user>\d+' '*						%{ this.popState(); return 'DIGIT'%}

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


\s+					%{ return 'SPACE'; %}
.					%{ this.begin('INITIAL'); return 'TEXT'; %} /* if we use .+ here, no SPACE will be found. (Don't know why.) */


/lex
	%left TEXT
	%left SPACE TITLE
	%left TAB
	%left PRO CONTRA PRO-OUT CONTRA-OUT

%start start

%% /* language grammar */

start
	: optionallinebreaks graphs EOF  {$2.splice(0,0,{name:"start", text:$1}); $2.push({name:"eof", text:$3}); return $2;}
	| EOF {return [{name:"eof", text:$1}];}
	;
ids
	: ids id {$1.ids.push($2); $1.text += $2; $$ = $1;}
	| id {$$ = {name:"ids", text:$1, ids:[$1]};}
	;
graphs
	: graphs EMPTYLINE graph %prec PRO { $1.push({name:"emptyline", text:$2}); $1.push($3); $$ = $1;}
	| graph %prec TAB { $$ = [$1];}
	;
graph
	: statement reasons %prec PRO { $$ = root; $$.children[0] = $1; }
	| statement %prec TEXT { $$ = {name:"graph", children:[$1]};}
	;
reasons
	: reasons reason {$$ = addChildToGraph($2);}
	| reason  {$$ = addChildToGraph($1, true);}
	;
reason
	: optionalnewline optionaltabs relation statement %prec PRO {
		$2.text = $1 + $2.text;
		$$ = {name:"reason", indent:$2.indent};
		addChildren($$,[$2,$3,$4]);
	}
	| optionalnewline optionaltabs relation optionalspace error {
		yy.errors = true;
		$2.text = $1 + $2.text;
		$$ = {name:"reason", indent:$2.indent};
		addChildren($$,[$2,$3, {name:"space",text:$4}]);
	}
	;
relation
	: PRO {$$ = {name:"relation", text:$1, type:"pro", direction:"to"};}
	| CONTRA {$$ = {name:"relation", text:$1, type:"contra", direction:"to"};}
	| PRO-OUT {$$ = {name:"relation", text:$1, type:"pro", direction:"from"};}
	| CONTRA-OUT  {$$ = {name:"relation", text:$1, type:"contra", direction:"from"};}
	;
statement
	: text %prec TEXT  {
		$$ = createNode("statement"); 
		addChildren($$,[$1]);
		}
	| TITLE text %prec TEXT  {
		$$ = createNode("statement"); 
		addChildren($$,[createTitleNode($1),$2]);
		}
	| TITLE %prec TEXT {
		$$ = createNode("statement"); 
		addChildren($$,[createTitleNode($1)]);
		}
	| id TITLE text {
		$$ = createNode("statement"); 
		addChildren($$,[$1,createTitleNode($2),$3]);
		}
	| id TITLE {
		$$ = createNode("statement"); 
		addChildren($$,[$1,createTitleNode($2)]);
		}
	| id text {
		$$ = createNode("statement"); 
		addChildren($$,[$1,$2]);
	}
	| id {
		$$ = createNode("statement"); 
		addChildren($$,[$1]);
		}
	;
text
	: optionalspace words optionalspace {$$ = {name:"text", text:$1 + $2 + $3};}
	;
optionaltabs
	: /*empty*/ {$$ = {name:"tabs", text:"", indent:0};}
	| tabs optionalspace {$$ = $1; $$.text = $$.text + $2;}
	;
tabs
	: tabs optionalspace TAB %prec TAB {$$=$1; $$.indent++; $$.text = $$.text + $2 + $3;}
	| TAB {$$ = {name:"tabs", text:$1, indent:1};}
	;
optionallinebreaks
	: optionalnewline
	| EMPTYLINE
	;
optionalnewline
	: /*empty*/ {$$ = "";}
	| NEWLINE {$$ = $1;}
	;
optionalspace
	: /*empty*/ {$$ = "";}
	| SPACE {$$ = $1;}
	;
id
	: USER DIGIT {$$ = {name:"id", text:$1+$2, id:extractID($1+$2), author:extractUser($1), authorIndex:$2};}
	| USER error {yy.errors = true; $$ = {name:"user", text:$1, user:extractUser($1)};}
	;
words
	: words SPACE word {$$ = $1 + $2 +$3}
	| word {$$ = $1;}
	;
word
	: word TEXT {$$ = $1 + $2;}/* We need to put together single chars here because otherwise the lexer won't find any spaces. (Don't know why.)*/
	| TEXT
	;



