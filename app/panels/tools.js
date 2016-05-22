function Panel (editor) {
  this.el = document.createElement('paper-button');
  this.el.setAttribute('raised','');
  this.el.classList.add('edit-button');
  this.el.innerHTML = 'Edit';
  this.el.addEventListener('click', this.onToggleClick.bind(this));

  this.editor = editor;
  this.active = false;
}

Panel.prototype.onToggleClick = function (e) {
  this.active = this.active === false;
  if (this.active) {
    this.editor.enable();
    this.el.innerHTML = 'Exit';
  } else {
    this.editor.disable();
    this.el.innerHTML = 'Edit';
  }
};

module.exports = Panel;
