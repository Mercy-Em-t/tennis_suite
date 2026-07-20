import * as fs from 'fs';
import * as path from 'path';

let permissionsCache: any = null;

function loadPermissions() {
  if (!permissionsCache) {
    try {
      const filePath = path.join(process.cwd(), 'public', '3d-state-machine', 'permissions.json');
      const data = fs.readFileSync(filePath, 'utf8');
      permissionsCache = JSON.parse(data);
    } catch (e) {
      console.error('Failed to load permissions.json', e);
      permissionsCache = { stages: {} };
    }
  }
  return permissionsCache;
}

/**
 * Validates whether a specific user role is allowed to perform an action
 * during the given lifecycle stage.
 * 
 * @param lifecyclePhase - The current lifecycle phase of the tournament (e.g., 'PRE_TOURNAMENT')
 * @param action - The action the user is attempting (e.g., 'Record Score')
 * @param userRole - The authenticated role of the user (e.g., 'REFEREE')
 * @returns boolean indicating whether the action is permitted
 */
export function verifyLifecycleAction(
  lifecyclePhase: string,
  action: string,
  userRole: string
): boolean {
  const perms = loadPermissions();
  
  const stage = perms.stages[lifecyclePhase];
  if (!stage) {
    console.warn(`[Permissions] Unknown lifecycle phase: ${lifecyclePhase}`);
    return false;
  }
  
  const actionPerms = stage.actions[action];
  if (!actionPerms) {
    console.warn(`[Permissions] Unknown action: ${action} in phase ${lifecyclePhase}`);
    return false;
  }
  
  const allowedRoles: string[] = actionPerms.allowedRoles || [];
  return allowedRoles.includes(userRole.toUpperCase());
}
