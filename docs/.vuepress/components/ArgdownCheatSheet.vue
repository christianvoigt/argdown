<template functional>
<div class="cheat-sheet-item">
<div class="source-view">
<slot name="source"></slot>    
</div>
<div class="explanation">
<h3 class="title"><slot name="title"></slot></h3>
<slot name="explanation"></slot>
</div>
</div>
</template>
<style lang="stylus">
.cheat-sheet-item {
    display: flex;
    flex-direction: row;
    border: 1px solid #eaecef;
    margin-top: -1px;

    pre.language-argdown {
        margin: 0;
        padding: 0;
    }

    .source-view {
        flex: 1;
        padding: 1rem;
    }

    .explanation .title {
        display: none;
        font-size: 0.8rem;
        color: #999;
    }

    .explanation {
        flex: 1;
        border-left: 1px solid #eaecef;
        padding: 1rem;
        line-height: 1.5rem;
    }
}
</style>