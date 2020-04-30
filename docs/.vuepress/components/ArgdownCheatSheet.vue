<template>
  <div class="cheat-sheet-item">
    <div class="source-view">
      <slot name="source"></slot>
    </div>
    <div class="explanation">
      <h3 class="title">
        <slot name="title"></slot>
      </h3>
      <slot name="explanation"></slot>
    </div>
  </div>
</template>
<style lang="stylus">
.cheat-sheet-item {
  box-sizing: border-box;

  .language-argdown.extra-class {
    @media (max-width: 419px) {
      margin: 0;
    }
  }

  @media (max-width: 1024px) and (orientation: portrait) {
    flex-direction: column;
  }

  color: #000;
  display: flex;
  flex-direction: row;
  border: 1px solid #eaecef;
  margin-top: -1px;
  background: #fff;

  pre {
    margin: 0;
    padding: 0;
    background-color: #fff;
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
    padding: 0rem;
    overflow: auto;

    pre.language-argdown {
      overflow: inherit;
    }
    argdown-map{
        border: 0;
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
