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
    box-sizing: border-box;

    @media (max-width: 1024px) and (orientation: portrait) {
        flex-direction: column;
    }

    color: #000;
    display: flex;
    flex-direction: row;
    border: 1px solid #eaecef;
    margin-top: -1px;
    background: #fff;

    pre.language-argdown {
        margin: 0;
        padding: 0;
    }

    .source-view {
        box-sizing: border-box;

        @media (max-width: 1024px) and (orientation: portrait) {
            width: 100%;
            height: auto;
            flex-basis: inherit;
            overflow: auto;
        }

        flex-grow: 1;
        flex-basis: 0;
        width: 50%;
        padding: 1rem;
        overflow: auto;

        pre.language-argdown {
            overflow: inherit;
        }
    }

    .explanation .title {
        display: none;
        font-size: 0.8rem;
        color: #999;
    }

    .explanation {
        box-sizing: border-box;

        @media (max-width: 1024px) and (orientation: portrait) {
            width: 100%;
            height: auto;
        }

        flex-grow: 1;
        flex-basis: 0;
        width: 50%;
        border-left: 1px solid #eaecef;
        padding: 1rem;
        line-height: 1.5rem;
    }
}
</style>