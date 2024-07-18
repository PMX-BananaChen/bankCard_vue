import {
	UPDATE_HEAD,
	UPDATE_LOADING,
	UPDATE_FOOTER,
	UPDATE_PAGE_TITLE,
	UPDATE_USERID,
	UPDATE_EMPNO
} from './data'

const state={
	headShow:true,
	loading:false,
	footerShow:true,
	pageTitle:'医疗挂号',
	userId:"",
	empNo:""
};


const mutations={
	/*head*/
	[UPDATE_HEAD](state,type){
		state.headShow=type;
	},
	/*loading*/
	[UPDATE_LOADING](state,type){
		state.loading=type;
	},
	/*footer*/
	[UPDATE_FOOTER](state,type){
		state.footerShow=type;
	},
	/*title*/
	[UPDATE_PAGE_TITLE](state,type){
		state.pageTitle=type;
	},
	/*userId*/
	[UPDATE_USERID](state,type){
		state.userId=type;
	},
	/*empNo*/
	[UPDATE_EMPNO](state,type){
		state.empNo=type;
	}
};

const getters={
	headShow(state){
		return state.headShow;
	},
	loading(state){
		return state.loading;
	},
	footerShow(state){
		return state.footerShow;
	},
	pageTitle(state){
		return state.pageTitle;
	},
	userId(state){
		return state.userId;
	},
	empNo(state){
		return state.empNo;
	}
};

export default{
	state,
	mutations,
	getters
}