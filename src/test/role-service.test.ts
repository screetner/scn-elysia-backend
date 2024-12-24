import { describe, expect, it, beforeEach, afterEach } from 'bun:test'
import sinon from 'sinon'
import {
  assignRole,
  changeRoleName,
  createRole,
  deleteRole,
  getAdminId,
  getRoleInformation,
  getRoleOrganization,
  getUnassignedRole,
  unassignRole,
  updateRolePermission,
} from '@/routes/role/role-service'
import { db } from '@/database/database'
import * as roleModel from '@/models/role'

describe('getRoleOrganization', () => {
  let selectStub: sinon.SinonStub

  beforeEach(() => {
    selectStub = sinon.stub(db, 'select').returns({
      from: sinon.stub().returnsThis(),
      leftJoin: sinon.stub().returnsThis(),
      where: sinon.stub().returnsThis(),
      groupBy: sinon.stub().resolves([]),
    })
  })

  afterEach((): void => {
    sinon.restore()
  })

  it('should return roles for the given organization ID', async () => {
    const mockResponse: roleModel.roleInOrg[] = [
      {
        roleId: 'role123',
        roleName: 'Admin',
        members: 5,
      },
    ]
    selectStub.returns({
      from: sinon.stub().returns({
        leftJoin: sinon.stub().returns({
          where: sinon.stub().returns({
            groupBy: sinon.stub().resolves(mockResponse),
          }),
        }),
      }),
    })

    const result: roleModel.roleInOrg[] = await getRoleOrganization('org123')

    expect(result).toEqual(mockResponse)
    sinon.assert.calledOnce(selectStub)
  })

  it('should return an empty array if no roles are found for the given organization ID', async () => {
    selectStub.returns({
      from: sinon.stub().returns({
        leftJoin: sinon.stub().returns({
          where: sinon.stub().returns({
            groupBy: sinon.stub().resolves([]),
          }),
        }),
      }),
    })

    const result: roleModel.roleInOrg[] = await getRoleOrganization('org123')

    expect(result).toEqual([])
    sinon.assert.calledOnce(selectStub)
  })
})

describe('getUnassignedRole', () => {
  let selectStub: sinon.SinonStub

  beforeEach(() => {
    selectStub = sinon.stub(db, 'select').returns({
      from: sinon.stub().returnsThis(),
      leftJoin: sinon.stub().returnsThis(),
      where: sinon.stub().resolves([]),
    })
  })

  afterEach(() => {
    sinon.restore()
  })

  it('should return unassigned roles for the given organization ID', async () => {
    const mockResponse: roleModel.roleMemberInformation[] = [
      {
        userId: 'user123',
        username: 'user1',
        email: 'user1@example.com',
      },
    ]
    selectStub.returns({
      from: sinon.stub().returns({
        leftJoin: sinon.stub().returns({
          where: sinon.stub().resolves(mockResponse),
        }),
      }),
    })

    const result: roleModel.roleMemberInformation[] =
      await getUnassignedRole('org123')

    expect(result).toEqual(mockResponse)
    sinon.assert.calledOnce(selectStub)
  })

  it('should return an empty array if no unassigned roles are found for the given organization ID', async () => {
    selectStub.returns({
      from: sinon.stub().returns({
        leftJoin: sinon.stub().returns({
          where: sinon.stub().resolves([]),
        }),
      }),
    })

    const result: roleModel.roleMemberInformation[] =
      await getUnassignedRole('org123')

    expect(result).toEqual([])
    sinon.assert.calledOnce(selectStub)
  })
})

describe('getRoleInformation', () => {
  let selectStub: sinon.SinonStub

  beforeEach(() => {
    selectStub = sinon.stub(db, 'select')
  })

  afterEach(() => {
    sinon.restore()
  })

  it('should return role information for the given role ID', async () => {
    const mockRoleInformation = {
      roleId: 'role123',
      roleName: 'Admin',
      abilityScope: roleModel.DEFAULT_PERMISSION,
    }
    const mockResponse = [mockRoleInformation]
    const mockMembers = [
      {
        userId: 'user123',
        username: 'user1',
        email: 'user1@example.com',
      },
    ]

    selectStub.onFirstCall().returns({
      from: sinon.stub().returns({
        where: sinon.stub().resolves(mockResponse),
      }),
    })

    selectStub.onSecondCall().returns({
      from: sinon.stub().returns({
        where: sinon.stub().resolves(mockMembers),
      }),
    })

    const result = await getRoleInformation('role123', 'org123')

    const expectedResponse: roleModel.roleManagement = {
      roleInfo: mockRoleInformation as roleModel.roleInformation,
      roleMembers: mockMembers,
      rolePermissions:
        mockRoleInformation.abilityScope as roleModel.rolePermission,
    }

    expect(result).toEqual(expectedResponse)
    sinon.assert.calledTwice(selectStub)
  })

  it('should throw an error if no role information is found for the given role ID', async () => {
    selectStub.onFirstCall().returns({
      from: sinon.stub().returns({
        where: sinon.stub().resolves([]),
      }),
    })

    expect(getRoleInformation('role123', 'org123')).rejects.toThrow(
      'Role with ID role123 not found in organization org123',
    )

    sinon.assert.calledOnce(selectStub)
  })
})

describe('assignRole', () => {
  let selectStub: sinon.SinonStub
  let updateStub: sinon.SinonStub

  beforeEach(() => {
    selectStub = sinon.stub(db, 'select')
    updateStub = sinon.stub(db, 'update')
  })

  afterEach(() => {
    sinon.restore()
  })

  const setupSelectStub = (newRole: any[], userRoles: any[]) => {
    selectStub.onFirstCall().returns({
      from: sinon.stub().returns({
        where: sinon.stub().resolves(newRole),
      }),
    })

    selectStub.onSecondCall().returns({
      from: sinon.stub().returns({
        leftJoin: sinon.stub().returns({
          where: sinon.stub().resolves(userRoles),
        }),
      }),
    })
  }

  it('should assign role to users if they do not have any role', async () => {
    const mockNewRole = [{ roleId: 'role123', organizationId: 'org123' }]
    const mockUserRoles = [
      {
        roleId: 'roleDefault',
        roleName: roleModel.DEFAULT_ROLE,
        organizationId: 'org123',
        username: 'user1',
      },
      {
        roleId: 'roleDefault',
        roleName: roleModel.DEFAULT_ROLE,
        organizationId: 'org123',
        username: 'user2',
      },
    ]
    const mockUpdatedUsers = [{ userId: 'user1' }, { userId: 'user2' }]

    setupSelectStub(mockNewRole, mockUserRoles)

    updateStub.returns({
      set: sinon.stub().returns({
        where: sinon.stub().returns({
          returning: sinon.stub().resolves(mockUpdatedUsers),
        }),
      }),
    })

    const result = await assignRole(['user1', 'user2'], 'role123', 'org123')

    expect(result).toEqual(mockUpdatedUsers)
    sinon.assert.calledTwice(selectStub)
    sinon.assert.calledOnce(updateStub)
  })

  it('should throw an error if a user already has a role assigned', async () => {
    const mockNewRole = [{ roleId: 'role123', organizationId: 'org123' }]
    const mockUserRoles = [
      {
        roleId: 'role456',
        roleName: 'Admin',
        organizationId: 'org123',
        username: 'user1',
      },
    ]

    setupSelectStub(mockNewRole, mockUserRoles)

    expect(assignRole(['user1'], 'role123', 'org123')).rejects.toThrow(
      'User user1 already has a role assigned',
    )

    sinon.assert.calledTwice(selectStub)
    sinon.assert.notCalled(updateStub)
  })

  it('should throw an error if a user is not part of the organization', async () => {
    const mockNewRole = [{ roleId: 'role123', organizationId: 'org123' }]
    const mockUserRoles = [
      {
        roleId: null,
        roleName: roleModel.DEFAULT_ROLE,
        organizationId: 'org456',
        username: 'user1',
      },
    ]

    setupSelectStub(mockNewRole, mockUserRoles)

    expect(assignRole(['user1'], 'role123', 'org123')).rejects.toThrow(
      'User user1 is not part of the organization',
    )

    sinon.assert.calledTwice(selectStub)
    sinon.assert.notCalled(updateStub)
  })
})

describe('unassignRole', () => {
  let selectStub: sinon.SinonStub
  let updateStub: sinon.SinonStub

  beforeEach(() => {
    selectStub = sinon.stub(db, 'select')
    updateStub = sinon.stub(db, 'update')
  })

  afterEach(() => {
    sinon.restore()
  })

  it('should unassign role from user and assign default role', async () => {
    const mockDefaultRole = [{ roleId: 'defaultRoleId' }]
    const mockUserData = [{ userId: 'user123', username: 'user1' }]
    const mockUpdatedUser = [{ userId: 'user123' }]

    selectStub.onFirstCall().returns({
      from: sinon.stub().returns({
        where: sinon.stub().resolves(mockDefaultRole),
      }),
    })

    selectStub.onSecondCall().returns({
      from: sinon.stub().returns({
        leftJoin: sinon.stub().returns({
          where: sinon.stub().resolves(mockUserData),
        }),
      }),
    })

    updateStub.returns({
      set: sinon.stub().returns({
        where: sinon.stub().returns({
          returning: sinon.stub().resolves(mockUpdatedUser),
        }),
      }),
    })

    const result = await unassignRole('user123', 'org123')

    expect(result).toEqual(mockUpdatedUser[0])
    sinon.assert.calledTwice(selectStub)
    sinon.assert.calledOnce(updateStub)
  })

  it('should throw an error if default role is not found', async () => {
    selectStub.onFirstCall().returns({
      from: sinon.stub().returns({
        where: sinon.stub().resolves([]),
      }),
    })

    expect(unassignRole('user123', 'org123')).rejects.toThrow(
      'Default role not found in organization org123',
    )

    sinon.assert.calledOnce(selectStub)
    sinon.assert.notCalled(updateStub)
  })

  it('should throw an error if user is not found or already has the default role', async () => {
    const mockDefaultRole = [{ roleId: 'defaultRoleId' }]

    selectStub.onFirstCall().returns({
      from: sinon.stub().returns({
        where: sinon.stub().resolves(mockDefaultRole),
      }),
    })

    selectStub.onSecondCall().returns({
      from: sinon.stub().returns({
        leftJoin: sinon.stub().returns({
          where: sinon.stub().resolves([]),
        }),
      }),
    })

    expect(unassignRole('user123', 'org123')).rejects.toThrow(
      'User user123 not found or already has the default role',
    )

    sinon.assert.calledTwice(selectStub)
    sinon.assert.notCalled(updateStub)
  })
})

describe('changeRoleName', () => {
  let selectStub: sinon.SinonStub
  let updateStub: sinon.SinonStub

  beforeEach(() => {
    selectStub = sinon.stub(db, 'select')
    updateStub = sinon.stub(db, 'update')
  })

  afterEach(() => {
    sinon.restore()
  })

  it('should change the role name successfully', async () => {
    const mockRole = [{ roleId: 'role123', roleName: 'OldRoleName' }]
    const mockUpdatedRole = [{ roleName: 'NewRoleName' }]

    selectStub.onFirstCall().returns({
      from: sinon.stub().returns({
        where: sinon.stub().resolves(mockRole),
      }),
    })

    updateStub.returns({
      set: sinon.stub().returns({
        where: sinon.stub().returns({
          returning: sinon.stub().resolves(mockUpdatedRole),
        }),
      }),
    })

    const result = await changeRoleName('role123', 'NewRoleName', 'org123')

    expect(result).toEqual({
      roleId: 'role123',
      oldName: 'OldRoleName',
      newName: 'NewRoleName',
    })
    sinon.assert.calledOnce(selectStub)
    sinon.assert.calledOnce(updateStub)
  })

  it('should throw an error if the role is not found', async () => {
    selectStub.onFirstCall().returns({
      from: sinon.stub().returns({
        where: sinon.stub().resolves([]),
      }),
    })

    expect(changeRoleName('role123', 'NewRoleName', 'org123')).rejects.toThrow(
      "Role 'NewRoleName' is duplicated or not found in your organization",
    )

    sinon.assert.calledOnce(selectStub)
    sinon.assert.notCalled(updateStub)
  })

  it('should throw an error if the role name is duplicated', async () => {
    selectStub.onFirstCall().returns({
      from: sinon.stub().returns({
        where: sinon.stub().resolves([]),
      }),
    })
    expect(changeRoleName('role123', 'RoleName', 'org123')).rejects.toThrow(
      "Role 'RoleName' is duplicated or not found in your organization",
    )
  })

  it('should throw an error if the role name is invalid', async () => {
    const mockRole = [{ roleId: 'role123', roleName: roleModel.ADMIN_ROLE }]

    selectStub.onFirstCall().returns({
      from: sinon.stub().returns({
        where: sinon.stub().resolves(mockRole),
      }),
    })

    expect(changeRoleName('role123', 'NewRoleName', 'org123')).rejects.toThrow(
      "Cannot change the name of the role 'Admin'",
    )

    sinon.assert.calledOnce(selectStub)
    sinon.assert.notCalled(updateStub)
  })

  it('should throw an error if the role name is invalid', async () => {
    const mockRole = [{ roleId: 'role123', roleName: roleModel.DEFAULT_ROLE }]

    selectStub.onFirstCall().returns({
      from: sinon.stub().returns({
        where: sinon.stub().resolves(mockRole),
      }),
    })

    expect(changeRoleName('role123', 'NewRoleName', 'org123')).rejects.toThrow(
      "Cannot change the name of the role 'Default'",
    )

    sinon.assert.calledOnce(selectStub)
    sinon.assert.notCalled(updateStub)
  })
})

describe('deleteRole', () => {
  let selectStub: sinon.SinonStub
  let deleteStub: sinon.SinonStub

  beforeEach(() => {
    selectStub = sinon.stub(db, 'select')
    deleteStub = sinon.stub(db, 'delete').returns({
      where: sinon.stub().resolves(),
    })
  })

  afterEach(() => {
    sinon.restore()
  })

  it('should delete the role successfully', async () => {
    const mockRole = { roleId: 'role123', roleName: 'RoleName' }

    selectStub.onFirstCall().returns({
      from: sinon.stub().returns({
        where: sinon.stub().resolves([mockRole]),
      }),
    })

    selectStub.onSecondCall().returns({
      from: sinon.stub().returns({
        where: sinon.stub().resolves([]),
      }),
    })

    const result = await deleteRole('role123', 'org123')

    expect(result).toEqual(mockRole)
    sinon.assert.calledTwice(selectStub)
    sinon.assert.calledOnce(deleteStub)
  })

  it('should throw an error if the role is not found', async () => {
    selectStub.onFirstCall().returns({
      from: sinon.stub().returns({
        where: sinon.stub().resolves([]),
      }),
    })

    expect(deleteRole('role123', 'org123')).rejects.toThrow(
      'Role with ID role123 not found in organization org123',
    )

    sinon.assert.calledOnce(selectStub)
    sinon.assert.notCalled(deleteStub)
  })

  it('should throw an error if the role has assigned users', async () => {
    const mockRole = { roleId: 'role123', roleName: 'RoleName' }
    const mockUsers = [{ userId: 'user123' }]

    selectStub.onFirstCall().returns({
      from: sinon.stub().returns({
        where: sinon.stub().resolves([mockRole]),
      }),
    })

    selectStub.onSecondCall().returns({
      from: sinon.stub().returns({
        where: sinon.stub().resolves(mockUsers),
      }),
    })

    expect(deleteRole('role123', 'org123')).rejects.toThrow(
      'Cannot delete role with ID role123 because it has assigned users',
    )

    sinon.assert.calledTwice(selectStub)
    sinon.assert.notCalled(deleteStub)
  })
})

describe('createRole', () => {
  let selectStub: sinon.SinonStub
  let insertStub: sinon.SinonStub

  beforeEach(() => {
    selectStub = sinon.stub(db, 'select')
    insertStub = sinon.stub(db, 'insert').returns({
      values: sinon.stub().returns({
        returning: sinon
          .stub()
          .resolves([{ roleId: 'newRoleId', roleName: 'New Role' }]),
      }),
    })
  })

  afterEach(() => {
    sinon.restore()
  })

  it('should create a new role successfully', async () => {
    selectStub.returns({
      from: sinon.stub().returns({
        where: sinon.stub().resolves([]),
      }),
    })

    const result = await createRole('org123')

    expect(result).toEqual({ roleId: 'newRoleId', roleName: 'New Role' })
    sinon.assert.calledOnce(selectStub)
    sinon.assert.calledOnce(insertStub)
  })

  it('should create a new role with a suffix if roles with the same name exist', async () => {
    selectStub.returns({
      from: sinon.stub().returns({
        where: sinon
          .stub()
          .resolves([{ roleName: 'New Role' }, { roleName: 'New Role 1' }]),
      }),
    })

    insertStub.returns({
      values: sinon.stub().returns({
        returning: sinon
          .stub()
          .resolves([{ roleId: 'newRoleId', roleName: 'New Role 2' }]),
      }),
    })

    const result = await createRole('org123')

    expect(result).toEqual({ roleId: 'newRoleId', roleName: 'New Role 2' })
    sinon.assert.calledOnce(selectStub)
    sinon.assert.calledOnce(insertStub)
  })
})

describe('updateRolePermission', () => {
  let selectStub: sinon.SinonStub
  let updateStub: sinon.SinonStub

  beforeEach(() => {
    selectStub = sinon.stub(db, 'select')
    updateStub = sinon.stub(db, 'update').returns({
      set: sinon.stub().returns({
        where: sinon.stub().resolves(),
      }),
    })
  })

  afterEach(() => {
    sinon.restore()
  })

  it('should update the role permission successfully', async () => {
    const mockRole = { roleId: 'role123', roleName: 'RoleName' }

    selectStub.returns({
      from: sinon.stub().returns({
        where: sinon.stub().resolves([mockRole]),
      }),
    })

    const result = await updateRolePermission(
      'role123',
      roleModel.DEFAULT_PERMISSION,
      'org123',
    )

    expect(result).toEqual(mockRole)
    sinon.assert.calledOnce(selectStub)
    sinon.assert.calledOnce(updateStub)
  })

  it('should throw an error if the role is admin', async () => {
    const mockRole = { roleId: 'role123', roleName: roleModel.ADMIN_ROLE }
    selectStub.returns({
      from: sinon.stub().returns({
        where: sinon.stub().resolves([mockRole]),
      }),
    })

    expect(
      updateRolePermission('role123', roleModel.DEFAULT_PERMISSION, 'org123'),
    ).rejects.toThrow("Cannot change permission of the role 'Admin'")

    sinon.assert.calledOnce(selectStub)
    sinon.assert.notCalled(updateStub)
  })

  it('should throw an error if the role is not found', async () => {
    selectStub.returns({
      from: sinon.stub().returns({
        where: sinon.stub().resolves([]),
      }),
    })

    expect(
      updateRolePermission('role123', roleModel.DEFAULT_PERMISSION, 'org123'),
    ).rejects.toThrow('Role with ID role123 not found in organization org123')

    sinon.assert.calledOnce(selectStub)
    sinon.assert.notCalled(updateStub)
  })
})

describe('getAdminId', () => {
  let selectStub: sinon.SinonStub

  beforeEach(() => {
    selectStub = sinon.stub(db, 'select')
  })

  afterEach(() => {
    sinon.restore()
  })

  it('should return the admin role ID for the given organization ID', async () => {
    const mockAdmin = { roleId: 'adminRoleId' }
    selectStub.returns({
      from: sinon.stub().returns({
        where: sinon.stub().resolves([mockAdmin]),
      }),
    })

    const result = await getAdminId('org123')
    expect(result).toEqual('adminRoleId')
    sinon.assert.calledOnce(selectStub)
  })

  it('should throw an error if no admin is found for the given organization ID', async () => {
    selectStub.returns({
      from: sinon.stub().returns({
        where: sinon.stub().resolves([]),
      }),
    })

    expect(getAdminId('org123')).rejects.toThrow(
      'Admin not found in organization org123',
    )
    sinon.assert.calledOnce(selectStub)
  })
})
