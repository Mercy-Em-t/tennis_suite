const tenantModels = ['match', 'team', 'pool', 'court', 'poolTeam', 'incidentReport'];
const unsafeMethods = ['findUnique', 'update', 'delete'];

const enforceTenantGating = {
  meta: {
    type: 'problem',
    docs: {
      description: 'Enforce row-level context gating for tenant models in tournament routes',
    },
    messages: {
      unsafeMethod: "Cross-contamination risk: Avoid using '{{method}}' on tenant model '{{model}}'. Use '{{safeMethod}}' and include tournamentId in the where clause.",
    },
  },
  create(context) {
    return {
      CallExpression(node) {
        // Only run on files within tournaments/[id] or similar tenant contexts
        const filename = context.filename || context.getFilename();
        const normalized = filename.replace(/\\/g, '/');
        
        // Target specifically the tournament contexts where IDOR is a risk
        if (!normalized.includes('api/tournaments/[id]')) {
          return;
        }

        // Look for prisma.[model].[method] or tx.[model].[method]
        if (node.callee.type === 'MemberExpression') {
          const methodNode = node.callee.property;
          if (methodNode && methodNode.type === 'Identifier') {
            const method = methodNode.name;
            if (unsafeMethods.includes(method)) {
              
              // Check the object it's called on
              const objectNode = node.callee.object;
              if (objectNode && objectNode.type === 'MemberExpression') {
                const modelNode = objectNode.property;
                if (modelNode && modelNode.type === 'Identifier') {
                  const model = modelNode.name;
                  
                  if (tenantModels.includes(model)) {
                    // It's an unsafe method on a tenant model within a tenant context
                    const safeMethod = method === 'findUnique' ? 'findFirst' : `${method}Many`;
                    
                    context.report({
                      node,
                      messageId: 'unsafeMethod',
                      data: {
                        method,
                        model,
                        safeMethod,
                      }
                    });
                  }
                }
              }
            }
          }
        }
      }
    };
  }
};

export const rules = {
  'enforce-tenant-gating': enforceTenantGating,
};

export default {
  rules
};
