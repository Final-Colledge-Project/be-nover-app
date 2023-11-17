import CreateTeamWorkspaceDto from './dtos/createTeamWorkspace.dto';
import TeamWorkspaceController from './teamWorkspace.controller';
import ITeamWorkspace from './teamWorkspace.interface';
import TeamWorkspaceRoute from './teamWorkspace.route';
import TeamWorkspaceService from './teamWorkspace.service';
import TeamWorkspaceSchema from './teamWorkspace.model';

export {
  TeamWorkspaceRoute,
  TeamWorkspaceController,
  TeamWorkspaceService,
  ITeamWorkspace,
  TeamWorkspaceSchema,
  CreateTeamWorkspaceDto
}
