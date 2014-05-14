/* description: Argdown Commands*/
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
%}

/* lexical grammar */
%lex

%s user


%%
\s*<<EOF>>						%{ this.begin('INITIAL'); return 'EOF'; %}


(' '*'['(.)+']'' '*) 				%{ return 'TITLE'; %}
' '*'@'\w+':' 						%{ this.begin('user'); return 'USER'; %}
<user>\d+' '*						%{ this.popState(); return 'DIGIT'%}

'cmd:'								%{ return 'CMD'; %}
<<EOF>>					%{ return 'EOF'; %}
('remove'|'rm')			%{ return 'REMOVE';%}
('@'\w+) 					%{ return 'ID';%}
'*'						%{ return 'ALL'; %}
\s 						%{ /*ignore whitespace*/ %}

/lex

%start start

%% /* language grammar */

start
	: optionallinebreaks cmd EOF {return [{name:"start", text:$1},$2,{name:"eof", text:$3}];}
	| EOF {return [{name:"eof", text:$1}];}
	;
cmd
	: CMD REMOVE ids  {$$ = {name: "cmd", text:$1+$2+$3.text, cmd:"REMOVE", ids:$3.ids};}
	| CMD REMOVE ALL {$$ = {name:"cmd", text:$1+$2+$3, cmd:"REMOVEALL"};}
	;
ids
	: ids id {$1.ids.push($2); $1.text += $2; $$ = $1;}
	| id {$$ = {name:"ids", text:$1, ids:[$1]};}
	;
id
	: USER DIGIT {$$ = {name:"id", text:$1+$2, id:extractID($1+$2), author:extractUser($1), authorIndex:$2};}
	| USER error {yy.errors = true; $$ = {name:"user", text:$1, user:extractUser($1)};}
	;


