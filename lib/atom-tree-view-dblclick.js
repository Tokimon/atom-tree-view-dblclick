'use babel';
/* global atom */

export default {
  treeView: null,

  activate(state) {
    return atom.packages.activatePackage('tree-view')
      .then((treeViewPkg) => {
        const treeView = this.treeView = treeViewPkg.mainModule.createView
          ? treeViewPkg.mainModule.createView()
          : treeViewPkg.mainModule.getTreeViewInstance();

        // Save old 'entryCliked' method so it can be restored later
        treeView.originalEntryClicked = treeView.entryClicked;

        // Override the original 'entryCliked' method
        treeView.entryClicked = (e) => {
          const { target, detail, offsetX } = e;
          const entry = target.closest('.entry');

          if(!entry) { return; }

          const isDir = entry.getAttribute('is') === 'tree-view-directory';
          const name = entry.querySelector('.name');
          const doubleCLick = detail > 1;
          const nameClicked = target === name;
          const entryClicked = target === entry;

          // Directory has a header element where we detect the click from,
          // So we ignore the entry click in that case
          let doClick = (!isDir && doubleCLick) ||
                        (
                          isDir && !entryClicked &&
                          (doubleCLick || (!nameClicked && offsetX < name.offsetLeft))
                        );


          if(doClick) { treeView.originalEntryClicked(e); }
        };
      });
  },

  deactivate() {
    this.treeView.entryClicked = this.treeView.originalEntryClicked;
    delete this.treeView.originalEntryClicked;
  }
};
