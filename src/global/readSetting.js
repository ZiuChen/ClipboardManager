import restoreSetting from './restoreSetting'

const setting = utools.dbStorage.getItem('setting') || restoreSetting()

export default setting
