// Pokemon 5e Status Marker Automation
  // Automatically applies status markers to tokens when status conditions are checked

  on('ready', function() {
      log('=== Pokemon 5e Status Marker System loaded ===');
  });

  // Listen for changes to status marker attributes
  on('change:attribute', function(obj, prev) {
      // Only process status_ attributes
      if (!obj.get('name').startsWith('status_')) return;

      const attrName = obj.get('name');
      const attrValue = obj.get('current');
      const characterId = obj.get('_characterid');

      // Get the character
      const character = getObj('character', characterId);
      if (!character) return;

      log(`Status change detected: ${attrName} = ${attrValue} for ${character.get('name')}`);

      // Find token(s) representing this character
      const tokens = findObjs({
          _type: 'graphic',
          _subtype: 'token',
          represents: characterId
      });

      if (tokens.length === 0) {
          log(`No token found for character: ${character.get('name')}`);
          return;
      }

      // Map attribute names to Roll20 marker names
      const markerMap = {
          'status_red': 'red',
          'status_skull': 'skull',
          'status_yellow': 'yellow',
          'status_blue': 'blue',
          'status_sleepy': 'sleepy',
          'status_purple': 'purple',
          'status_brown': 'brown'
      };

      const markerName = markerMap[attrName];
      if (!markerName) return;

      // Update each token
      tokens.forEach(token => {
          updateTokenMarker(token, markerName, attrValue === '1');
      });
  });

  // Function to add or remove a status marker from a token
  function updateTokenMarker(token, markerName, shouldAdd) {
      const currentMarkers = token.get('statusmarkers') || '';
      const markerArray = currentMarkers ? currentMarkers.split(',') : [];

      // Remove the marker if it exists
      const filteredMarkers = markerArray.filter(m => m !== markerName && !m.startsWith(markerName + '@'));

      // Add the marker if needed
      if (shouldAdd) {
          filteredMarkers.push(markerName);
      }

      // Update token
      const newMarkers = filteredMarkers.join(',');
      token.set('statusmarkers', newMarkers);

      log(`Token "${token.get('name')}" markers updated: ${newMarkers}`);
  }

  log('=== Pokemon 5e Status Marker System ready ===');