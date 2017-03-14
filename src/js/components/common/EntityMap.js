var React = require('react');
var ReactDOM = require('react-dom');
var util = require('utils/util');
import {findItemById} from 'utils/store-utils';

// Requires google loaded

export default class EntityMap extends React.Component {
  static defaultProps = {
    center: null,
    entities: [],
    // Each entity must be an object with properties id, lat, and lon
    visible: true,
    addClass: null,
    google_maps: null,
    mapOpts: {},
    focusEntity: null,
    labelAtt: "name",
    labelFn: null,
    style: null,
    focusIds: [], // New way to focus (currently support both)
    defaultZoom: 7
  }

  constructor(props) {
    super(props);
    this.state = {
      map: null,
      markers: []
    }

    this.PIN_LOOKUP = {}; // entity id -> pin object
  }

  componentDidMount() {
    this.initMap();
  }

  g() {
    return this.props.google_maps;
  }

  componentDidUpdate(prevProps, prevState) {
    var entitiesUpdated = prevProps.entities.length != this.props.entities.length;
    if (entitiesUpdated) {
      this.redrawPins(prevProps.entities);
    } else if ((this.props.focusEntity != prevProps.focusEntity) || !util.arrEquals(prevProps.focusIds, this.props.focusIds)) {
      this.redrawFocus();
    } else if ((this.props.center != prevProps.center) && this.props.center) {
      this.moveCenter();
    }
  }

  getMap() {
    return this.state.map;
  }

  addPin(center, title, icon, draggable) {
    let g = this.g();
    let map = this.getMap();
    var marker = new g.Marker({
      map: map,
      position: center,
      title: title,
      icon: icon,
      draggable: draggable || false
    });
    return marker;
  }

  setMapBounds(markers){
    let g = this.g();
    let map = this.getMap();
    var latlngbounds = new g.LatLngBounds();
    for (var i = 0; i < markers.length; i++) {
      latlngbounds.extend(markers[i].position);
    }
    map.fitBounds(latlngbounds);
  }

  getMarkerIcon(e) {
    if (typeof(this.props.markerIcon) === "function") {
      return this.props.markerIcon(e);
    } else return this.props.markerIcon;
  }

  getFocusMarkerIcon(e) {
    if (typeof(this.props.focusMarkerIcon) === "function") {
      return this.props.focusMarkerIcon(e);
    } else return this.props.focusMarkerIcon || this.getMarkerIcon(e);
  }

  entityIsFocused(e) {
    return (this.props.focusEntity && this.props.focusEntity.id == e.id) ||
      (this.props.focusIds.indexOf(e.id) > -1);
  }

  initMap() {
    let g = this.g();
    var mapDiv = ReactDOM.findDOMNode(this.refs.map);
    var myOptions = {
        zoom: this.props.defaultZoom,
        center: this.props.center,
        disableDoubleClickZoom: false,
        mapTypeId: g.MapTypeId.ROADMAP
    }
    util.mergeObject(myOptions, this.props.mapOpts);
    var map = new g.Map(mapDiv, myOptions);
    this.setState({map: map}, () => {
      if (this.props.entities.length > 0) this.redrawPins();
    });
  }

  updateBounds(markers) {
    if (!markers) {
      markers = [];
      this.props.entities.forEach((e) => {
        let pin = this.getPin(e.id);
        if (pin) markers.push(pin);
      });
    }
    if (markers.length > 1) this.setMapBounds(markers);
    else if (markers.length == 1) {
      this.moveCenter(markers[0].position);
      this.state.map.setZoom(this.props.defaultZoom);
    }
  }

  forAllEntities(fn, _entities) {
    var entities = _entities || this.props.entities;
    if (entities) {
      entities.forEach((e) => {
        if (e) fn(e);
      });
    }
  }

  getEntityById(_id) {
    return findItemById(this.props.entities, _id, 'id');
  }

  getPin(_id) {
    return this.PIN_LOOKUP[_id];
  }

  redrawFocus() {
    this.forAllEntities((e) => {
      let pin = this.getPin(e.id);
      if (pin) {
        var focused = this.entityIsFocused(e);
        var icon = focused ? this.getFocusMarkerIcon(e) : this.getMarkerIcon(e);
        pin.setIcon(icon);
      }
    });
  }

  redrawPins(priorEntities) {
    var that = this;
    let g = this.g();
    if (priorEntities) {
      this.forAllEntities((e) => { // For prior list
        let pin = this.getPin(e.id);
        if (pin) pin.setMap(null); // Remove from map
      }, priorEntities);
    }
    var markers = [];
    this.forAllEntities((e) => { // For all now current entities
      if (e.lat != 0 || e.lon != 0) {
        var center = new g.LatLng(e.lat, e.lon);
        // Is there a mem leak here?
        var focused = this.entityIsFocused(e);
        var marker = focused ? this.props.focusMarkerIcon : this.getMarkerIcon(e);
        var title = this.props.labelFn ? this.props.labelFn(e) : e[this.props.labelAtt];
        let pin = this.addPin(center, title, marker, false);
        this.PIN_LOOKUP[e.id] = pin;
        markers.push(pin);
        g.event.addListener(pin, 'click', () => {
          if (this.props.handleEntityClick) this.props.handleEntityClick(e);
        });
        g.event.addListener(pin, 'dblclick', () => {
          if (this.props.handleEntityDoubleClick) this.props.handleEntityDoubleClick(e);
        });
      }
    });
    this.setState({markers: markers}, function() {
      that.updateBounds(markers);
    });
  }

  refreshMarkers() {
    this.redrawPins(this.props.entities);
  }

  moveCenter(loc) {
    var _loc = loc || this.props.center;
    this.state.map.panTo(_loc);
  }

  render() {
    var classes = "";
    if (this.props.addClass) classes += this.props.addClass;
    return (
      <div ref="map" className={classes} hidden={!this.props.visible} style={this.props.style}>
      </div>
    );
  }
};
