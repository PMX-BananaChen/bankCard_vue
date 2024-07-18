<template>
  <div class="hello">
    <h4></h4>
    <van-form @submit="onSubmit">
      <van-field
        v-model="workNo"
        label="工号"
        placeholder="工号"
        :rules="[{ required: true, message: '请填写工号' }]"
        readonly
      />
      <van-field v-model="bankAccountFlag" label="状态" readonly />
      <van-field
        v-model="cardId"
        label="银行卡号"
        placeholder="银行卡号"
        @blur="getBankCardInfo(cardId)"
        :rules="[{ required: true, message: '请输入您的银行卡号' }]"
      >
        <template #button>
          <van-uploader :after-read="afterUploaderimg" accept="image/*">
            <van-button icon="photograph" type="info" size="small"></van-button>
          </van-uploader>
        </template>
      </van-field>
      <van-field
        v-model="bankName"
        label="银行名称"
        placeholder="银行名称"
        :rules="[{ required: true, message: '请填写银行名称' }]"
        readonly
      />
      <div style="margin: 16px">
        <van-button round block type="info" native-type="submit"
          >提交</van-button
        >
      </div>
    </van-form>
  </div>
</template>

<script>
function getUrlParam(name) {
  //封装方法
  var reg = new RegExp("(^|&)" + name + "=([^&]*)(&|$)"); //构造一个含有目标参数的正则表达式对象
  var r = window.location.search.substr(1).match(reg); // 匹配目标参数
  if (r != null) return unescape(r[2]);
  return null; //返回参数值
}

import Vue from "vue";
import axios from "axios";
import qs from "qs";
import {
  Field,
  Button,
  Form,
  Toast,
  Uploader,
  Cell,
  CellGroup,
  Dialog,
} from "vant";
import { bankCardAttribution } from "../assets/js/bankCardAttribution";
Vue.use(Field)
  .use(Button)
  .use(Form)
  .use(Toast)
  .use(Uploader)
  .use(Cell)
  .use(CellGroup)
  .use(Dialog);
export default {
  inject: ["reload"],
  name: "HelloWorld",

  data() {
    return {
      msg: "Welcome to Your Vue.js App",
      message: "",
      bankCode: "",
      bankName: "",
      bankCardType: "",
      workNo: "",
      //卡号
      cardId: "",
      bankAccountFlag: "HR系统未建立",
      imgFile: "",
      count: "",
      empSalaryGroup: "",
    };
  },
  watch: {
    ["cardId"](val) {
      this.$nextTick(() => {
        this.cardId = val.replace(/\D/g, "").replace(/....(?!$)/g, "$& ");
      });
    },
  },
  created() {
    if (
      this.$store.getters.userId === "" ||
      this.$store.getters.userId === null
    ) {
      const code = getUrlParam("code"); //截取路径中的code，如果没有就去微信授权，如果已经获取到了就直接传code给后台获取openId
      console.log("code===>" + code);
      if (code) {
        //通过code获取 openId等用户信息
        this.$axios
          .get("OAuth2/authorize?name=bankCardKS&area=KS&code=" + code)
          .then((res) => {
            let datas = res.data;
            if (datas.code === 1) {
              console.log("授权成功");
              this.$store.commit("UPDATE_USERID", datas.data.userId);
              this.$store.commit("UPDATE_EMPNO", datas.data.empNo);
              this.userId = datas.data.userId;
              this.workNo = datas.data.empNo;
              this.$axios
                .get("OAuth2/selectEmpInfo?workNo=" + this.workNo)
                .then((res) => {
                  let datas = res.data;
                  if (datas.code === 1) {
                    if (datas.data != null) {
                      // if (datas.data.bankAccountFlag == "Y") {
                        this.bankAccountFlag = "HR系统已建立";
                      // }
                      this.empSalaryGroup = datas.data.empSalaryGroup;
                    }
                  }
                })
                .catch((error) => {
                  console.log(error);
                });
              Dialog.alert({
                title: "提示",
                message:
                  "1.仅限员工更换工资卡号或新员工登记工资卡号, 公司已为您办理银行卡的请忽略!\n2.非本人工资卡号薪资转账将不成功。",
              });
            }
          })
          .catch((error) => {
            console.log(error);
          });
      } else {
        this.getCodeApi("bankCard");
      }
    }
  },
  methods: {
    afterUploaderimg(file) {
      const toast = Toast.loading({
        duration: 0, // 持续展示 toast
        forbidClick: true,
        message: "识别中...",
      });

      let img = file.content;
      let image = new Image(); //新建一个img标签（还没嵌入DOM节点)
      image.src = img;
      let _this = this;
      image.onload = function () {
        let canvas = document.createElement("canvas"),
          context = canvas.getContext("2d"),
          data = "";
        ///
        // 此段为压缩图片代码
        if (image.width >= 1000 || image.height >= 1000) {
          var imageWidth = image.width / 2; //压缩后图片的大小
          var imageHeight = image.height / 2;
        } else {
          var imageWidth = image.width;
          var imageHeight = image.height;
        }

        canvas.width = imageWidth;
        canvas.height = imageHeight;

        context.drawImage(image, 0, 0, imageWidth, imageHeight);

        data = canvas.toDataURL(file.file.type);

        // 获取base64码
        // replace 替换一个与正则表达式匹配的子串
        let base64 = data.replace(/data:image\/[A-Za-z]+;base64,/, "");
        base64 = encodeURIComponent(base64);
        // base64 作为上传的参数
        let param = {
          imgFile: base64,
        };
        axios
          .post(`OAuth2/getBankCardInfo`, JSON.stringify(param), {
            headers: {
              "Content-Type": "application/json; charset=UTF-8",
            },
          })
          .then((res) => {
            let datas = res.data;
            if (datas.code === 1) {
              if (datas.data.bankCardType == "1") {
                _this.cardId = datas.data.bankCardNumber;
                _this.cardId = _this.cardId.replace(/\s*/g, "");
                let obj = bankCardAttribution(_this.cardId);
                _this.bankCode = obj.bankCode;
                _this.bankName = datas.data.bankName;
                Toast.clear();
              } else if (datas.data.bankCardType == "0") {
                Toast.fail("未能识别");
              } else {
                Toast.fail("暂只支持借记卡(储蓄卡)");
              }
            } else if (datas.code === 8) {
              _this.$vux.toast.text(datas.msg, "middle");
            }
          })
          .catch((error) => {
            console.log(error);
          });
      };
    },
    getBankCardInfo(cardId) {
      //暂不支持邮储和建设以外的银行卡
      // console.log(bankCardAttribution(cardId));
      cardId = cardId.replace(/\s*/g, "");
      let obj = {};
      obj = bankCardAttribution(cardId);
      this.bankCode = obj.bankCode;
      this.bankName = obj.bankName;
      this.bankCardType = obj.cardType;
      if (
        this.bankName == null
        // || (this.bankCode != "ZCN10" && this.bankCode != "ZCN20")
      ) {
        Toast.fail("卡号无效");
      }
      if (this.bankCardType != "DC") {
        Toast.fail("暂只支持储蓄卡");
      }
      console.log(this.bankCode, this.bankName);
    },
    getCodeApi(state) {
      //获取code
      let urlNow = encodeURIComponent(window.location.href);
      let scope = "snsapi_base"; //snsapi_userinfo   //静默授权 用户无感知
      let appid = "ww6702157cf83bd8ff";
      let url = `https://open.weixin.qq.com/connect/oauth2/authorize?appid=${appid}&redirect_uri=${urlNow}&response_type=code&scope=${scope}&state=${state}#wechat_redirect`;
      window.location.replace(url);
    },
    onSubmit() {
      if (
        this.empSalaryGroup == "D4" ||
        this.empSalaryGroup == "C4" ||
        this.empSalaryGroup == "K4"
      ) {
        Dialog.alert({
          message: "所属薪资组无需登记工资卡",
        }).then(() => {
          window.location.href = "about:blank";
          window.close();
        });
      } else {
        Dialog.confirm({
          title: "确认卡号",
          message: this.cardId,
        }).then(() => {
          const toast = Toast.loading({
            duration: 0, // 持续展示 toast
            forbidClick: true,
            message: "绑定中...",
          });
          //KS this.bankCode != "ZCN10" && 
          if (this.bankCode != "ZCN20") {
            Toast.fail("暂不支持工商以外的银行卡");
          } else {
            let record = {
              workNo: this.workNo,
              bankCode: this.bankCode,
              cardId: this.cardId.replace(/\s*/g, ""),
            };
            axios
              .post(`AttendanceQuery/addBankCardInfo`, JSON.stringify(record), {
                headers: {
                  "Content-Type": "application/json; charset=UTF-8",
                },
              })
              .then((res) => {
                let datas = res.data;
                if (datas.code === 1) {
                  Toast.clear();
                  Dialog.alert({
                    message: "绑定成功",
                  }).then(() => {
                    window.location.href = "about:blank";
                    window.close();
                  });
                } else {
                  Toast.fail(datas.msg);
                }
              })
              .catch((error) => {
                console.log(error);
              });
          }
        });
      }
    },
  },
};
</script>

<!-- Add "scoped" attribute to limit CSS to this component only -->
<style scoped>
h1,
h2 {
  font-weight: normal;
}
ul {
  list-style-type: none;
  padding: 0;
}
li {
  display: inline-block;
  margin: 0 10px;
}
a {
  color: #42b983;
}
</style>
