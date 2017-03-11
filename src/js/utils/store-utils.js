export default {
  removeItemsById: function(collection, id_list, _id_prop) {
    var id_prop = _id_prop || "id";
    return collection.filter(function(x) { return id_list.indexOf(x[id_prop]) == -1; } )
  },
  findItemById: function(collection, id, _id_prop) {
    var id_prop = _id_prop || "id";
    return collection.find(x => x && x[id_prop] === id);
  },
  findIndexById: function(collection, id, _id_prop) {
    var id_prop = _id_prop || "id";
    var ids = collection.map(function(x) {return (x != null) ? x[id_prop] : null; });
    return ids.indexOf(id);
  }
};