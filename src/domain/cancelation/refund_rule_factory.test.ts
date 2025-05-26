import { RefundRuleFactory } from "./refund_rule_factory";
import { FullRefund } from "./full_refund";
import { PartialRefund } from "./partial_refund";
import { NoRefund } from "./no_refund";

describe("RefundRuleFactory", () => {
  
  it("deve retornar FullRefund quando a reserva for cancelada com mais de 7 dias de antecedência", () => {
    const refundRule = RefundRuleFactory.getRefundRule(8);
    expect(refundRule).toBeInstanceOf(FullRefund);
  });

  it("deve retornar PartialRefund quando a reserva for cancelada entre 1 e 7 dias de antecedência", () => {
    expect(RefundRuleFactory.getRefundRule(7)).toBeInstanceOf(PartialRefund);
    expect(RefundRuleFactory.getRefundRule(3)).toBeInstanceOf(PartialRefund);
    expect(RefundRuleFactory.getRefundRule(1)).toBeInstanceOf(PartialRefund);
  });

  it("deve retornar NoRefund quando a reserva for cancelada com menos de 1 dia de antecedência", () => {
    expect(RefundRuleFactory.getRefundRule(0)).toBeInstanceOf(NoRefund);
    expect(RefundRuleFactory.getRefundRule(-1)).toBeInstanceOf(NoRefund);
  });

});