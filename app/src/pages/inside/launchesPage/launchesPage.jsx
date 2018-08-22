import React, { Component } from 'react';
import PropTypes from 'prop-types';
import { connect } from 'react-redux';
import { injectIntl, intlShape } from 'react-intl';
import { PageLayout, PageSection } from 'layouts/pageLayout';
import { fetch } from 'common/utils';
import { URLS } from 'common/urls';
import { PaginationToolbar } from 'components/main/paginationToolbar';
import { activeProjectSelector, userIdSelector } from 'controllers/user';
import { withPagination } from 'controllers/pagination';
import { withSorting, SORTING_DESC } from 'controllers/sorting';
import { showModalAction } from 'controllers/modal';
import {
  debugModeSelector,
  selectedLaunchesSelector,
  toggleLaunchSelectionAction,
  unselectAllLaunchesAction,
  validationErrorsSelector,
  proceedWithValidItemsAction,
  forceFinishLaunchesAction,
  mergeLaunchesAction,
  compareLaunchesAction,
  moveLaunchesAction,
  launchesSelector,
  launchPaginationSelector,
  fetchLaunchesAction,
  lastOperationSelector,
  loadingSelector,
  NAMESPACE,
  toggleAllLaunchesAction,
} from 'controllers/launch';
import { LaunchSuiteGrid } from 'pages/inside/common/launchSuiteGrid';
import { LaunchToolbar } from './LaunchToolbar';

@connect(
  (state) => ({
    debugMode: debugModeSelector(state),
    userId: userIdSelector(state),
    activeProject: activeProjectSelector(state),
    url: URLS.launches(activeProjectSelector(state)),
    selectedLaunches: selectedLaunchesSelector(state),
    validationErrors: validationErrorsSelector(state),
    launches: launchesSelector(state),
    lastOperation: lastOperationSelector(state),
    loading: loadingSelector(state),
  }),
  {
    showModalAction,
    toggleLaunchSelectionAction,
    unselectAllLaunchesAction,
    proceedWithValidItemsAction,
    forceFinishLaunchesAction,
    mergeLaunchesAction,
    compareLaunchesAction,
    moveLaunchesAction,
    fetchLaunchesAction,
    toggleAllLaunchesAction,
  },
)
@withSorting({
  defaultSortingColumn: 'start_time',
  defaultSortingDirection: SORTING_DESC,
})
@withPagination({
  paginationSelector: launchPaginationSelector,
  namespace: NAMESPACE,
})
@injectIntl
export class LaunchesPage extends Component {
  static propTypes = {
    debugMode: PropTypes.bool.isRequired,
    intl: intlShape.isRequired,
    launches: PropTypes.arrayOf(PropTypes.object),
    activePage: PropTypes.number,
    itemCount: PropTypes.number,
    pageCount: PropTypes.number,
    pageSize: PropTypes.number,
    sortingColumn: PropTypes.string,
    sortingDirection: PropTypes.string,
    showModalAction: PropTypes.func,
    onChangePage: PropTypes.func,
    onChangePageSize: PropTypes.func,
    onChangeSorting: PropTypes.func,
    activeProject: PropTypes.string.isRequired,
    selectedLaunches: PropTypes.arrayOf(PropTypes.object),
    validationErrors: PropTypes.object,
    toggleAllLaunchesAction: PropTypes.func,
    unselectAllLaunchesAction: PropTypes.func,
    proceedWithValidItemsAction: PropTypes.func,
    toggleLaunchSelectionAction: PropTypes.func,
    forceFinishLaunchesAction: PropTypes.func,
    mergeLaunchesAction: PropTypes.func,
    compareLaunchesAction: PropTypes.func,
    moveLaunchesAction: PropTypes.func,
    lastOperation: PropTypes.string,
    loading: PropTypes.bool,
    fetchLaunchesAction: PropTypes.func,
  };

  static defaultProps = {
    launches: [],
    activePage: 1,
    itemCount: null,
    pageCount: null,
    pageSize: 20,
    sortingColumn: null,
    sortingDirection: null,
    showModalAction: () => {},
    onChangePage: () => {},
    onChangePageSize: () => {},
    onChangeSorting: () => {},
    selectedLaunches: [],
    validationErrors: {},
    toggleAllLaunchesAction: () => {},
    unselectAllLaunchesAction: () => {},
    proceedWithValidItemsAction: () => {},
    toggleLaunchSelectionAction: () => {},
    forceFinishLaunchesAction: () => {},
    mergeLaunchesAction: () => {},
    compareLaunchesAction: () => {},
    moveLaunchesAction: () => {},
    lastOperation: '',
    loading: false,
    fetchLaunchesAction: () => {},
  };

  updateLaunch = (launch) => {
    fetch(URLS.launchesUpdate(this.props.activeProject, launch.id), {
      method: 'put',
      data: launch,
    }).then(this.props.fetchLaunchesAction);
  };
  deleteItem = (id) => {
    fetch(URLS.launches(this.props.activeProject, id), {
      method: 'delete',
    }).then(this.props.fetchLaunchesAction);
  };
  confirmDeleteItem = (item) => {
    this.props.showModalAction({
      id: 'launchDeleteModal',
      data: { item, onConfirm: () => this.deleteItem(item.id) },
    });
  };

  finishForceLaunches = (eventData) => {
    const launches = eventData && eventData.id ? [eventData] : this.props.selectedLaunches;
    this.props.forceFinishLaunchesAction(launches, {
      fetchFunc: this.props.fetchLaunchesAction,
    });
  };

  openEditModal = (launch) => {
    this.props.showModalAction({
      id: 'launchEditModal',
      data: { launch, onEdit: this.updateLaunch },
    });
  };
  openImportModal = () => {
    this.props.showModalAction({
      id: 'launchImportModal',
      data: {
        onImport: this.props.fetchLaunchesAction,
      },
    });
  };

  handleAllLaunchesSelection = () => this.props.toggleAllLaunchesAction(this.props.launches);

  proceedWithValidItems = () =>
    this.props.proceedWithValidItemsAction(this.props.lastOperation, this.props.selectedLaunches);

  mergeLaunches = () =>
    this.props.mergeLaunchesAction(this.props.selectedLaunches, {
      fetchFunc: this.props.fetchLaunchesAction,
    });

  moveLaunches = (eventData) => {
    const launches = eventData && eventData.id ? [eventData] : this.props.selectedLaunches;
    this.props.moveLaunchesAction(launches, {
      fetchFunc: this.props.fetchLaunchesAction,
      debugMode: this.props.debugMode,
    });
  };

  compareLaunches = () => this.props.compareLaunchesAction(this.props.selectedLaunches);

  render() {
    const {
      activePage,
      itemCount,
      pageCount,
      pageSize,
      onChangePage,
      onChangePageSize,
      sortingColumn,
      sortingDirection,
      onChangeSorting,
      selectedLaunches,
      launches,
      loading,
      debugMode,
    } = this.props;
    return (
      <PageLayout>
        <PageSection>
          <LaunchToolbar
            errors={this.props.validationErrors}
            onRefresh={this.props.fetchLaunchesAction}
            selectedLaunches={selectedLaunches}
            onUnselect={this.props.toggleLaunchSelectionAction}
            onUnselectAll={this.props.unselectAllLaunchesAction}
            onProceedValidItems={this.proceedWithValidItems}
            onMove={this.moveLaunches}
            onMerge={this.mergeLaunches}
            onForceFinish={this.finishForceLaunches}
            onCompare={this.compareLaunches}
            onImportLaunch={this.openImportModal}
            debugMode={debugMode}
          />
          <LaunchSuiteGrid
            data={launches}
            sortingColumn={sortingColumn}
            sortingDirection={sortingDirection}
            onChangeSorting={onChangeSorting}
            onDeleteItem={this.confirmDeleteItem}
            onMove={this.moveLaunches}
            onEditLaunch={this.openEditModal}
            onForceFinish={this.finishForceLaunches}
            selectedItems={selectedLaunches}
            onItemSelect={this.props.toggleLaunchSelectionAction}
            onAllItemsSelect={this.handleAllLaunchesSelection}
            withHamburger
            loading={loading}
          />
          <PaginationToolbar
            activePage={activePage}
            itemCount={itemCount}
            pageCount={pageCount}
            pageSize={pageSize}
            onChangePage={onChangePage}
            onChangePageSize={onChangePageSize}
          />
        </PageSection>
      </PageLayout>
    );
  }
}
