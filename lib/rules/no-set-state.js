/**
 * @fileoverview Prevent usage of setState
 * @author Mark Dalgleish
 */
'use strict';

const has = require('has');
const Components = require('../util/Components');

// ------------------------------------------------------------------------------
// Rule Definition
// ------------------------------------------------------------------------------

module.exports = {
  meta: {
    docs: {
      description: 'Prevent usage of setState',
      category: 'Stylistic Issues',
      recommended: false
    },
    schema: []
  },

  create: Components.detect((context, components, utils) => {
    /**
     * Checks if the component is valid
     * @param {Object} component The component to process
     * @returns {Boolean} True if the component is valid, false if not.
     */
    function isValid(component) {
      return Boolean(component && !component.useSetState);
    }

    /**
     * Reports usages of setState for a given component
     * @param {Object} component The component to process
     */
    function reportSetStateUsages(component) {
      let setStateUsage;
      for (let i = 0, j = component.setStateUsages.length; i < j; i++) {
        setStateUsage = component.setStateUsages[i];
        context.report({
          node: setStateUsage,
          message: 'Do not use setState'
        });
      }
    }

    // --------------------------------------------------------------------------
    // Public
    // --------------------------------------------------------------------------

    return {

      CallExpression: function(node) {
        const callee = node.callee;
        if (
          callee.type !== 'MemberExpression' ||
          callee.object.type !== 'ThisExpression' ||
          callee.property.name !== 'setState'
        ) {
          return;
        }
        const component = components.get(utils.getParentComponent());
        const setStateUsages = component && component.setStateUsages || [];
        setStateUsages.push(callee);
        components.set(node, {
          useSetState: true,
          setStateUsages: setStateUsages
        });
      },

      'Program:exit': function() {
        const list = components.list();
        for (const component in list) {
          if (!has(list, component) || isValid(list[component])) {
            continue;
          }
          reportSetStateUsages(list[component]);
        }
      }
    };
  })
};
