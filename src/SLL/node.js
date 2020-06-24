class _Node{
  constructor(value=null, next=null, previous=null){
    this.value=value;
    this.next=next;
    this.previous=previous; // only for doubly linked lists
  }
}

module.exports = _Node;