var ano = 2021;
const debug = false;

// https://dre.pt/home/-/dre/117942337/details/maximized
// https://info.portaldasfinancas.gov.pt/pt/informacao_fiscal/legislacao/diplomas_legislativos/Documents/Portaria_27_2020.pdf
// https://dre.pt/dre/detalhe/portaria/294-2021-175780035
var IAS = ano===2019 ? 435.76 : (ano===2020 ? 438.81 : 443.2);

// Mínimo de Existência
// https://info.portaldasfinancas.gov.pt/pt/informacao_fiscal/codigos_tributarios/cirs_rep/Pages/irs70.aspx
var minimoExistencia = 1.5 * 14 * IAS;

// Salário mínimo nacional
// https://dre.pt/home/-/dre/117503933/details/maximized
// https://dre.pt/home/-/dre/126365738/details/maximized
// https://files.dre.pt/1s/2021/12/23601/0000500009.pdf
var salarioMinimo = ano===2019 ? 600 * 14 : (ano===2019 ? 635 * 14 : 705 * 14);

// Valor mínimo de Deduçōes Específicas
// Página 8: https://info.portaldasfinancas.gov.pt/pt/apoio_contribuinte/Folhetos_informativos/Documents/IRS_folheto_2019.pdf
const minDeducaoEspecifica = 4104;

// Ponto 4 do https://info.portaldasfinancas.gov.pt/pt/informacao_fiscal/codigos_tributarios/cirs_rep/Pages/irs70.aspx
var thresholdIRS = Math.max(minimoExistencia, salarioMinimo);

// Escalões IRS
// 2019
// https://info.portaldasfinancas.gov.pt/pt/informacao_fiscal/codigos_tributarios/cirs_rep/ra/Pages/irs68ra_202003.aspx
// 2020
// https://info.portaldasfinancas.gov.pt/pt/informacao_fiscal/codigos_tributarios/cirs_rep/Pages/irs68.aspx
//
// Incluindo escalōes adicionais de solidariedade (mesmo em ambos os anos)
// https://info.portaldasfinancas.gov.pt/pt/informacao_fiscal/codigos_tributarios/cirs_rep/Pages/irs68a.aspx
if (ano===2019) {
  var escalao0 = {valor:   7091, percentagem: 0.145, escalao: 0};
  var escalao1 = {valor:  10700, percentagem: 0.230, escalao: 1};
  var escalao2 = {valor:  20261, percentagem: 0.285, escalao: 2};
  var escalao3 = {valor:  25000, percentagem: 0.350, escalao: 3};
  var escalao4 = {valor:  36856, percentagem: 0.370, escalao: 4};
  // €80,000 e não €80,882 devido aos escalōes adicionais de solidariedade
  var escalao5 = {valor:  80000, percentagem: 0.450, escalao: 5};
  var escalao6 = {valor:  80640, percentagem: 0.475, escalao: 6};
  var escalao7 = {valor: 250000, percentagem: 0.505, escalao: 7};
  var escalao8 = {valor: 250000, percentagem: 0.530, escalao: 8};
} else {
  // 2020
  // 2021
  var escalao0 = {valor:   7112, percentagem: 0.145, escalao: 0};
  var escalao1 = {valor:  10732, percentagem: 0.230, escalao: 1};
  var escalao2 = {valor:  20322, percentagem: 0.285, escalao: 2};
  var escalao3 = {valor:  25075, percentagem: 0.350, escalao: 3};
  var escalao4 = {valor:  36967, percentagem: 0.370, escalao: 4};
  // €80,000 e não €80,882 devido aos escalōes adicionais de solidariedade
  var escalao5 = {valor:  80000, percentagem: 0.450, escalao: 5};
  var escalao6 = {valor:  80882, percentagem: 0.475, escalao: 6};
  var escalao7 = {valor: 250000, percentagem: 0.505, escalao: 7};
  var escalao8 = {valor: 250000, percentagem: 0.530, escalao: 8};
}

// value format
const formato = '0,0.00';
const formato2 = '0,0';

// TODO:
// Ponto 1 d) do https://info.portaldasfinancas.gov.pt/pt/informacao_fiscal/codigos_tributarios/cirs_rep/Pages/irs78d.aspx
// PPRs


function rendimentoColectavel(rendimentoAnualBruto) {

  // Contribuições: TSU trabalhador (Contribuição para a Segurança Social)
  // Págia 2: http://www.seg-social.pt/documents/10152/16175054/Taxas_Contributivas_2019.pdf/5ea23f5f-e7c4-400f-958b-4ff12c41ca0e
  // Assumindo a taxa para "Trabalhadores em geral"
  var tsuTrabalhador = rendimentoAnualBruto * 0.11;

  // Deduçōes Específicas
  // Página 8: https://info.portaldasfinancas.gov.pt/pt/apoio_contribuinte/Folhetos_informativos/Documents/IRS_folheto_2019.pdf
  var deducaoEspecifica = Math.max(minDeducaoEspecifica, tsuTrabalhador)

  var rendimentoColectavel = rendimentoAnualBruto - deducaoEspecifica

  return [Math.max(0, rendimentoColectavel), deducaoEspecifica];
}


function calcularColetaTotal(rendimentoColectavel, escaloes, escalao0, ultimoEscalao) {

  // Obter a coleta do primeiro escalao
  var escalao = escalao0;
  var coletaTotal = Math.min(rendimentoColectavel, escalao0.valor) * escalao0.percentagem;

  for (var i = 1; i < escaloes.length; i++) {
    var escalaoAnterior = escaloes[i-1];
    var escalaoActual = escaloes[i];

    // Obter a parcela do rendimento que se encontra no escalao actual
    var rendimentoNoEscalaoAtual = Math.min(rendimentoColectavel-escalaoAnterior.valor, escalaoActual.valor-escalaoAnterior.valor)

    if (rendimentoNoEscalaoAtual > 0) {
      escalao = escalaoActual;
    }

    // somar a respectiva coleta
    coletaTotal += Math.max(0, rendimentoNoEscalaoAtual) * escalaoActual.percentagem;
  }

  // Somar a coleta acima do ultimo escalao
  rendimentoNoEscalaoAtual = Math.max(0, rendimentoColectavel-ultimoEscalao.valor);
  coletaTotal += rendimentoNoEscalaoAtual * ultimoEscalao.percentagem;

  if (rendimentoNoEscalaoAtual > 0) {
    escalao = ultimoEscalao;
  }

  return [coletaTotal, escalao];
}


function calcularColetaLiquida(rendimentoAnualBruto, rendimentoAnualBrutoSujeito, coletaTotal, quoeficienteFamiliar, threshold) {

  // Se receber menos do que o Mínimo de Existência ou do que o Salário Mínimo,
  // a diferença é deduzida na coleta total
  // https://info.portaldasfinancas.gov.pt/pt/informacao_fiscal/codigos_tributarios/cirs_rep/Pages/irs70.aspx
  if (rendimentoAnualBruto - coletaTotal < threshold*quoeficienteFamiliar) {
    return Math.max(0, rendimentoAnualBrutoSujeito - threshold);
  } else {
    return Math.max(0, coletaTotal/quoeficienteFamiliar);
  }
}


function calcularDeducoesColeta(rendimentoColectavel, quoeficienteFamiliar, ascendentes, dependentes3Menos, dependentes3Mais, estadoCivil, tributacaoSeparado,
  despesasGerais, despesasSaude, despesasEducacao, despesasHabitacao, despesasLares, despesasPensoesAlimentos,
  despesasAutomoveis, despesasMotociclos, despesasRestauracao, despesasCabeleireiros, despesasVeterinario, despesasPasses)
  {

  // Pontos 1, 2 e 3 do https://info.portaldasfinancas.gov.pt/pt/informacao_fiscal/codigos_tributarios/cirs_rep/Pages/irs78a.aspx
  var valorDependente3Menos = 726;
  var valorDependente3Mais = 600;
  var valorDependente3MenosExtra = (300-126); // retirar a parcela que já se encontra em "valorDependente3Menos"
  var valorAscendente = ascendentes===1 ? 635 : 525;

  var deducoesDependentesAscendentes = dependentes3Menos*valorDependente3Menos +
                                       dependentes3Mais*valorDependente3Mais +
                                       (ano===2020 ? Math.max(0, dependentes3Menos-1)*valorDependente3MenosExtra : 0) +
                                       ascendentes*valorAscendente;
  if ((estadoCivil==='Casado/Unido de facto') && tributacaoSeparado) {
    deducoesDependentesAscendentes = deducoesDependentesAscendentes / 2;
  }

  // Ponto 1 do https://info.portaldasfinancas.gov.pt/pt/informacao_fiscal/codigos_tributarios/cirs_rep/Pages/irs78b.aspx
  // por cada sujeito passivo
  var deducoesDespesasGerais = Math.min(0.35*despesasGerais, 250*quoeficienteFamiliar);
  // Ponto 9 do https://info.portaldasfinancas.gov.pt/pt/informacao_fiscal/codigos_tributarios/cirs_rep/Pages/irs78b.aspx
  if ((estadoCivil==='Solteiro, divorciado, viúvo ou separado judicialmente') && (dependentes3Menos+dependentes3Mais)>=1) {
    deducoesDespesasGerais = Math.min(0.45*despesasGerais, 335);
  }

  // Ponto 1 do https://info.portaldasfinancas.gov.pt/pt/informacao_fiscal/codigos_tributarios/cirs_rep/Pages/irs78c.aspx
  var deducoesSaude = Math.min(0.15*despesasSaude, 1000);

  // Ponto 1 do https://info.portaldasfinancas.gov.pt/pt/informacao_fiscal/codigos_tributarios/cirs_rep/Pages/irs78d.aspx
  var deducoesEducacao = Math.min(0.30*despesasEducacao, 800);

  // Ponto 1 e 4 do https://info.portaldasfinancas.gov.pt/pt/informacao_fiscal/codigos_tributarios/cirs_rep/Pages/irs78e.aspx
  if (rendimentoColectavel<=escalao0.valor) {
    // a) Para contribuintes que tenham um rendimento coletável igual ou inferior ao valor do primeiro escalão do n.º 1 do artigo 68.º, um montante de € 800;
    var threshold = 800;
  } else if ((rendimentoColectavel>escalao0.valor) && (rendimentoColectavel<=30000)) {
    // b) Para contribuintes que tenham um rendimento coletável superior ao valor do primeiro escalão do n.º 1 do artigo 68.º e igual ou inferior a € 30 000, o limite resultante da aplicação da seguinte fórmula:
    var normalization = (30000-rendimentoColectavel) / (30000-escalao0.valor);
    var threshold = 502 + (800-502) * normalization;
  } else {
    // c) Para contribuintes que tenham um rendimento coletável superior ao valor do último escalão do n.º 1 do artigo 68.º, o montante de € 1 000.
    var threshold = 502;
  }

  var deducoesHabitacao = Math.min(0.15*despesasHabitacao, threshold);

  // Ponto 1 e 3 do https://info.portaldasfinancas.gov.pt/pt/informacao_fiscal/codigos_tributarios/cirs_rep/Pages/irs78f.aspx
  var despesasIva = despesasAutomoveis+despesasMotociclos+despesasRestauracao+despesasCabeleireiros+despesasVeterinario;
  // Assumindo que todas as faturas têm IVA a 23%.
  var deducoesIva = Math.min(0.23/1.23*despesasIva*0.15, 250) + 0.23/1.23*despesasPasses;

  // Ponto 1 do https://info.portaldasfinancas.gov.pt/pt/informacao_fiscal/codigos_tributarios/cirs_rep/Pages/irs83a.aspx
  var deducoesPensoesAlimentos = 0.20*despesasPensoesAlimentos;

  // Ponto 1 do https://info.portaldasfinancas.gov.pt/pt/informacao_fiscal/codigos_tributarios/cirs_rep/Pages/irs84.aspx
  var deducoesLares = Math.min(0.25*despesasLares, 403.75);

  // Ponto 3 do https://info.portaldasfinancas.gov.pt/pt/informacao_fiscal/codigos_tributarios/cirs_rep/Pages/irs78.aspx
  var restantesDeducoes = deducoesSaude + deducoesEducacao + deducoesHabitacao + deducoesPensoesAlimentos + deducoesIva + deducoesLares;

  if (debug) {
    console.log('deducoesDependentesAscendentes', deducoesDependentesAscendentes);
    console.log('deducoesDespesasGerais', deducoesDespesasGerais);
    console.log('deducoesSaude', deducoesSaude);
    console.log('deducoesEducacao', deducoesEducacao);
    console.log('deducoesHabitacao', deducoesHabitacao);
    console.log('deducoesPensoesAlimentos', deducoesPensoesAlimentos);
    console.log('deducoesIva', deducoesIva);
    console.log('deducoesLares', deducoesLares);
  }

  return [deducoesDespesasGerais, deducoesDependentesAscendentes, restantesDeducoes];
}


function limitarDeducoesColeta(deducoesDespesasGerais, deducoesDependentesAscendentes, restantesDeducoes, escalao, rendimentoColectavel, dependentes, tributacaoSeparado) {
  // Ponto 7 do https://info.portaldasfinancas.gov.pt/pt/informacao_fiscal/codigos_tributarios/cirs_rep/Pages/irs78.aspx

  if (escalao==0) {
    // a) Para contribuintes que tenham um rendimento coletável igual ou inferior ao valor do 1.º escalão do n.º 1 artigo 68.º, sem limite;
    var threshold = Number.POSITIVE_INFINITY;
  } else if (escalao<=6) {
    // b) Para contribuintes que tenham um rendimento coletável superior ao valor do 1.º escalão e igual ou inferior ao valor do último escalão do n.º 1 do artigo 68.º, o limite resultante da aplicação da seguinte fórmula:
    var normalization = (escalao6.valor-rendimentoColectavel) / (escalao6.valor-escalao0.valor);
    var threshold = 1000 + (2500-1000) * normalization;
  } else {
    // c) Para contribuintes que tenham um rendimento coletável superior ao valor do último escalão do n.º 1 do artigo 68.º, o montante de € 1 000.
    var threshold = 1000;
  }

  // Ponto 14 a) do https://info.portaldasfinancas.gov.pt/pt/informacao_fiscal/codigos_tributarios/cirs_rep/Pages/irs78.aspx
  if (tributacaoSeparado) {
    threshold = threshold / 2;
  }

  // Ponto 8 do https://info.portaldasfinancas.gov.pt/pt/informacao_fiscal/codigos_tributarios/cirs_rep/Pages/irs78.aspx
  if (dependentes>=3) {
    threshold = threshold * (1 + 0.05 * dependentes)
  }

  return Math.min(restantesDeducoes, threshold) + deducoesDependentesAscendentes + deducoesDespesasGerais;
}


function abaixoMinimoExistencia(rendimentoAnualBruto, rendimentoColectavel, dependentes, tributacaoSeparado) {
  // Pontos 1 e 4 do https://info.portaldasfinancas.gov.pt/pt/informacao_fiscal/codigos_tributarios/cirs_rep/Pages/irs70.aspx
  if(rendimentoAnualBruto < minimoExistencia) {
    return true;
  }

  // Pontos 2 e 3 do https://info.portaldasfinancas.gov.pt/pt/informacao_fiscal/codigos_tributarios/cirs_rep/Pages/irs70.aspx
  if(dependentes === 3 || dependentes === 4) {
    var minimo = tributacaoSeparado ? 11320/2 : 11320;
    if(rendimentoColectavel <= minimo) {
      return true;
    }
  } else if(dependentes >= 5) {
    var minimo = tributacaoSeparado ? 15560/2 : 15560;
    if(rendimentoColectavel <= minimo) {
      return true;
    }
  }

  return false
}


function calcularIRS(rendimentoAnualBrutoA, rendimentoAnualBrutoB, estadoCivil, tributacao, ascendentes, dependentes3Menos, dependentes3Mais,
  despesasGerais, despesasSaude, despesasEducacao, despesasHabitacao, despesasLares, despesasPensoesAlimentos,
  despesasAutomoveis, despesasMotociclos, despesasRestauracao, despesasCabeleireiros, despesasVeterinario, despesasPasses)
  {

  // ter a certeza que este rendimento é 0 nesta condição
  if (estadoCivil==='Solteiro, divorciado, viúvo ou separado judicialmente') {
    rendimentoAnualBrutoB = 0;
  }

  // Rendimento Colectável
  var [rendimentoColectavelA, deducaoEspecificaA] = rendimentoColectavel(rendimentoAnualBrutoA);
  var [rendimentoColectavelB, deducaoEspecificaB] = rendimentoColectavel(rendimentoAnualBrutoB);
  var deducoesEspecificas = deducaoEspecificaA + (rendimentoAnualBrutoB>0 ? deducaoEspecificaB: 0);

  // calcular o IRS progressivamente
  var escaloes = [escalao0, escalao1, escalao2, escalao3, escalao4,
                  escalao5, escalao6, escalao7];

  if ((estadoCivil==='Casado/Unido de facto') && (tributacao==='Separado')) {

    var [coletaTotalA, escalaoA] = calcularColetaTotal(rendimentoColectavelA, escaloes, escalao0, escalao8);
    var [coletaTotalB, escalaoB] = calcularColetaTotal(rendimentoColectavelB, escaloes, escalao0, escalao8);
    var coletaTotal = coletaTotalA + coletaTotalB;
    var taxa = `${numeral(escalaoA.percentagem*100).format('0,0.0')}% | ${numeral(escalaoB.percentagem*100).format('0,0.0')}%`;

    var coletaLiquidaA = calcularColetaLiquida(rendimentoAnualBrutoA, rendimentoAnualBrutoA, coletaTotalA, 1, thresholdIRS);
    var coletaLiquidaB = calcularColetaLiquida(rendimentoAnualBrutoB, rendimentoAnualBrutoB, coletaTotalB, 1, thresholdIRS);

    // Garantir que a coleta liquida não é superior à total
    coletaLiquidaA = Math.min(coletaLiquidaA, coletaTotalA);
    coletaLiquidaB = Math.min(coletaLiquidaB, coletaTotalB);

    // Ponto 7 do https://info.portaldasfinancas.gov.pt/pt/informacao_fiscal/codigos_tributarios/cirs_rep/Pages/irs78.aspx
    // Estamos a assumir que cada sujeito passivo foi responsável por 50% de cada despesa
    var [deducoesDespesasGeraisA, deducoesDependentesAscendentesA, restantesDeducoesA] = calcularDeducoesColeta(
      rendimentoColectavelA, 1, ascendentes, dependentes3Menos, dependentes3Mais, estadoCivil, true,
      despesasGerais/2, despesasSaude/2, despesasEducacao/2, despesasHabitacao/2, despesasLares/2, despesasPensoesAlimentos/2,
      despesasAutomoveis/2, despesasMotociclos/2, despesasRestauracao/2, despesasCabeleireiros/2, despesasVeterinario/2, despesasPasses/2
    );
    var [deducoesDespesasGeraisB, deducoesDependentesAscendentesB, restantesDeducoesB] = calcularDeducoesColeta(
      rendimentoColectavelB, 1, ascendentes, dependentes3Menos, dependentes3Mais, estadoCivil, true,
      despesasGerais/2, despesasSaude/2, despesasEducacao/2, despesasHabitacao/2, despesasLares/2, despesasPensoesAlimentos/2,
      despesasAutomoveis/2, despesasMotociclos/2, despesasRestauracao/2, despesasCabeleireiros/2, despesasVeterinario/2, despesasPasses/2
    );

    var deducoesColetaA = limitarDeducoesColeta(deducoesDespesasGeraisA, deducoesDependentesAscendentesA, restantesDeducoesA, escalaoA.escalao, rendimentoColectavelA, dependentes3Menos+dependentes3Mais, true);
    var deducoesColetaB = limitarDeducoesColeta(deducoesDespesasGeraisB, deducoesDependentesAscendentesB, restantesDeducoesB, escalaoB.escalao, rendimentoColectavelB, dependentes3Menos+dependentes3Mais, true);

    // https://info.portaldasfinancas.gov.pt/pt/informacao_fiscal/codigos_tributarios/cirs_rep/Pages/irs70.aspx
    var abaixoExistenciaA = abaixoMinimoExistencia(rendimentoAnualBrutoA, rendimentoColectavelA, dependentes3Menos+dependentes3Mais, true);
    if (abaixoExistenciaA) {
      deducoesColetaA = Math.min(deducoesColetaA, coletaTotalA);
    }
    var abaixoExistenciaB = abaixoMinimoExistencia(rendimentoAnualBrutoB, rendimentoColectavelB, dependentes3Menos+dependentes3Mais, true);
    if (abaixoExistenciaB) {
      deducoesColetaB = Math.min(deducoesColetaB, coletaTotalB);
    }

    // Deduçōes à Coleta
    // https://info.portaldasfinancas.gov.pt/pt/informacao_fiscal/codigos_tributarios/cirs_rep/Pages/irs78.aspx
    var deducoesColeta = deducoesColetaA + deducoesColetaB;
    var coletaLiquida = (abaixoExistenciaA ? 0 : (coletaLiquidaA - Math.min(coletaLiquidaA,deducoesColetaA))) + (abaixoExistenciaB ? 0 : (coletaLiquidaB - Math.min(coletaLiquidaB,deducoesColetaB)));

    if (debug) {
      console.log('rendimentoColectavelA', rendimentoColectavelA);
      console.log('rendimentoColectavelB', rendimentoColectavelB);
      console.log('coletaTotalA', coletaTotalA);
      console.log('coletaTotalB', coletaTotalB);
      console.log('deducoesColetaA', deducoesColetaA);
      console.log('deducoesColetaB', deducoesColetaB);
      console.log('coletaLiquida', coletaLiquida);
    }
  } else {
    // situações
    // estadoCivil==='Solteiro, divorciado, viúvo ou separado judicialmente'
    // (estadoCivil==='Casado/Unido de facto') && (tributacao==='Conjunto')

    var rendimentoAnualBrutoTotal = rendimentoAnualBrutoA + rendimentoAnualBrutoB;

    // Quoeficiente Familiar
    // https://info.portaldasfinancas.gov.pt/pt/informacao_fiscal/codigos_tributarios/cirs_rep/Pages/irs69.aspx
    var quoeficienteFamiliar = (tributacao==='Conjunto') && (estadoCivil==='Casado/Unido de facto') ? 2 : 1;

    // Ponto 1 do https://info.portaldasfinancas.gov.pt/pt/informacao_fiscal/codigos_tributarios/cirs_rep/Pages/irs69.aspx
    var rendimentoColectavelFinal = (rendimentoColectavelA + rendimentoColectavelB) / quoeficienteFamiliar;

    var [coletaTotal, escalao] = calcularColetaTotal(rendimentoColectavelFinal, escaloes, escalao0, escalao8);
    var taxa = `${numeral(escalao.percentagem*100).format('0,0.0')}%`;

    // Ponto 3 do https://info.portaldasfinancas.gov.pt/pt/informacao_fiscal/codigos_tributarios/cirs_rep/Pages/irs69.aspx
    coletaTotal = coletaTotal * quoeficienteFamiliar;

    var coletaLiquida = calcularColetaLiquida(rendimentoAnualBrutoTotal, rendimentoAnualBrutoA, coletaTotal, quoeficienteFamiliar, thresholdIRS) +
                        (rendimentoAnualBrutoB>0 ? calcularColetaLiquida(rendimentoAnualBrutoTotal, rendimentoAnualBrutoB, coletaTotal, quoeficienteFamiliar, thresholdIRS): 0);

    // Garantir que a coleta liquida não é superior à total
    coletaLiquida = Math.min(coletaLiquida, coletaTotal);

    // Ponto 7 do https://info.portaldasfinancas.gov.pt/pt/informacao_fiscal/codigos_tributarios/cirs_rep/Pages/irs78.aspx
    var [deducoesDespesasGerais, deducoesDependentesAscendentes, restantesDeducoes] = calcularDeducoesColeta(
      rendimentoColectavelFinal, quoeficienteFamiliar, ascendentes, dependentes3Menos, dependentes3Mais, estadoCivil, false,
      despesasGerais, despesasSaude, despesasEducacao, despesasHabitacao, despesasLares, despesasPensoesAlimentos,
      despesasAutomoveis, despesasMotociclos, despesasRestauracao, despesasCabeleireiros, despesasVeterinario, despesasPasses
    );

    var deducoesColeta = limitarDeducoesColeta(deducoesDespesasGerais, deducoesDependentesAscendentes, restantesDeducoes, escalao.escalao, rendimentoColectavelFinal, dependentes3Menos+dependentes3Mais, false);

    // https://info.portaldasfinancas.gov.pt/pt/informacao_fiscal/codigos_tributarios/cirs_rep/Pages/irs70.aspx
    var abaixoExistencia = abaixoMinimoExistencia(rendimentoAnualBrutoTotal, rendimentoColectavelFinal, dependentes3Menos+dependentes3Mais, false);
    if (abaixoExistencia) {
      deducoesColeta = Math.min(deducoesColeta, coletaTotal);
    }

    // Deduçōes à Coleta
    coletaLiquida = abaixoExistencia ? 0 : (coletaLiquida - Math.min(coletaLiquida, deducoesColeta));

    if (debug) {
      console.log('rendimentoAnualBrutoTotal', rendimentoAnualBrutoTotal);
      console.log('rendimentoColectavelA', rendimentoColectavelA);
      console.log('rendimentoColectavelB', rendimentoColectavelB);
      console.log('rendimentoColectavelFinal', rendimentoColectavelFinal);
      console.log('quoeficienteFamiliar', quoeficienteFamiliar);
      console.log('coletaTotal', coletaTotal);
      console.log('deducoesColeta', deducoesColeta);
      console.log('coletaLiquida', coletaLiquida);
    }
  }

  var irs = Math.max(0, coletaLiquida);

  if (debug) {
    console.log('IRS', irs);
  }

  return [deducoesEspecificas, rendimentoColectavelA + rendimentoColectavelB, taxa, coletaTotal, deducoesColeta, irs];
}


function calcularIRS_IL_flat(rendimentoAnualBrutoA, rendimentoAnualBrutoB, estadoCivil, dependentes3Menos, dependentes3Mais, ascendentes) {
  return calcularIRS_IL(rendimentoAnualBrutoA, rendimentoAnualBrutoB, estadoCivil, dependentes3Menos, dependentes3Mais, ascendentes, true)
}


function calcularIRS_IL_2escaloes(rendimentoAnualBrutoA, rendimentoAnualBrutoB, estadoCivil, dependentes3Menos, dependentes3Mais, ascendentes) {
  return calcularIRS_IL(rendimentoAnualBrutoA, rendimentoAnualBrutoB, estadoCivil, dependentes3Menos, dependentes3Mais, ascendentes, false)
}


function calcularIRS_IL(rendimentoAnualBrutoA, rendimentoAnualBrutoB, estadoCivil, dependentes3Menos, dependentes3Mais, ascendentes, is_flat) {

  // https://iniciativaliberal.pt/wp-content/uploads/2022/01/Iniciativa-Liberal-Programa-Eleitoral-2022.pdf

  dependentes = dependentes3Menos + dependentes3Mais;

  // ter a certeza que este rendimento é 0 nesta condição
  if (estadoCivil==='Solteiro, divorciado, viúvo ou separado judicialmente') {
    rendimentoAnualBrutoB = 0;
  }

  // a isenção é para cada sujeito passivo
  var sujeitosPassivos = rendimentoAnualBrutoB > 0 ? 2 : 1;

  var valorIsencao = thresholdIRS * sujeitosPassivos;
  var isencaoMensalILExtra = rendimentoAnualBrutoB > 0 ? 200 : 400;
  valorIsencao += isencaoMensalILExtra * (dependentes + ascendentes) * 14 * sujeitosPassivos;

  var rendColetavel = rendimentoAnualBrutoA + rendimentoAnualBrutoB - valorIsencao;

  if (is_flat) {
    var irs = rendColetavel * 0.15;
  } else {
    // calcular irs final
    if (rendColetavel > 30000) {
      var irs = 30000 * 0.15 + (rendColetavel-30000) * 0.28;
    } else {
      var irs = rendColetavel * 0.15;
    }
  }

  irs = Math.max(0, irs);

  if (debug) {
    console.log('IRS_IL', irs);
  }

  return irs
}


function calcularRendLiquido(rendimentoAnualBrutoA, rendimentoAnualBrutoB, pagarIRS) {

  // Estamos a pedir o salário bruto anual considerando 14 meses
  var rendimentoAnualBruto = rendimentoAnualBrutoA + rendimentoAnualBrutoB;

  // Contribuições: TSU trabalhador (Quota parte da contribuição para a Segurança Social)
  //                TSU empresa     (Quota parte da contribuição para a Segurança Social)
  // Págia 2: http://www.seg-social.pt/documents/10152/16175054/Taxas_Contributivas_2019.pdf/5ea23f5f-e7c4-400f-958b-4ff12c41ca0e
  // Assumindo a taxa para "Trabalhadores em geral"
  var tsuTrabalhador = rendimentoAnualBruto * 0.11;
  var tsuEmpresa = rendimentoAnualBruto * 0.2375;

  // Quanto vai cair na conta do(s) sujeito(s) passivo(s)
  var rendTrabalhador = rendimentoAnualBruto - pagarIRS - tsuTrabalhador;

  // Quanto vai para o Estado
  var rendEstado = pagarIRS + tsuTrabalhador + tsuEmpresa;

  // Pago pela empresa
  var pagoEmpresa = rendimentoAnualBruto + tsuEmpresa;

  return [rendTrabalhador, rendEstado, pagoEmpresa]

}


function atualizarTabelaIRS(irsActual, irsIL, il_escaloes, rendimentoA, rendimentoB, estadoCivil,
  tributacao, ascendentes, dependentes, deducoesEspecificas, rendimentoColectavel,
  taxa, coletaTotal, deducoesColeta, valorTrabalhador, valorEstado)
{

  // ter a certeza que este rendimento é 0 nesta condição
  if (estadoCivil==='Solteiro, divorciado, viúvo ou separado judicialmente') {
    rendimentoB = 0;
  }

  var rendimentoAnual = rendimentoA+rendimentoB;

  // Resumo das opções escolhidas
  var p_summary = $('#summary');
  var pRendimento = estadoCivil==='Casado/Unido de facto' ? `${numeral(rendimentoA/14).format(formato)}€ + ${numeral(rendimentoB/14).format(formato)}€` : `${numeral(rendimentoA/14).format(formato)}€`;
  var pEstadoCivilTributacao = estadoCivil==='Casado/Unido de facto' ? `Casado | ${tributacao}` : 'Solteiro';
  var pAscendetes = ascendentes===0 ? 'Sem ascendentes' : `${ascendentes} ascendente(s)`;
  var pDependentes = dependentes===0 ? 'Sem dependentes' : `${dependentes} dependente(s)`;
  p_summary.text(`${pRendimento} | ${pEstadoCivilTributacao} | ${pDependentes} | ${pAscendetes}`);

  // Onde irá aparecer o rendimento anual bruto
  var span_rendimento = $('#rendimento')
  var fRendimentoAnual = numeral(rendimentoAnual).format(formato);
  span_rendimento.text(`${fRendimentoAnual}€`);

  // Onde irá aparecer o valor que o trabalhador recebe
  var span_valorTrabalhador = $('#valorTrabalhador');
  var fValorTrabalhador = numeral(valorTrabalhador).format(formato);
  span_valorTrabalhador.text(`${fValorTrabalhador}€`);

  // Onde irá aparecer o valor para o Estado
  var span_valorEstado = $('#valorEstado');
  var fValorEstado = numeral(valorEstado).format(formato);
  span_valorEstado.text(`${fValorEstado}€`);

  // Onde irá aparecer o valor de IRS segundo o actual sistema
  var span_irsAtual = $('#irsAtual');
  var fIrsAtual = numeral(irsActual).format(formato);
  span_irsAtual.text(`${fIrsAtual}€`);

  // Detalhes do cálculo de IRS do actual Sistema
  var span_deducoesEspecificas = $('#deducoesEspecificas')
  span_deducoesEspecificas.text(`${numeral(deducoesEspecificas).format(formato)}€`);

  var span_rendimentoColectavel = $('#rendimentoColectavel')
  span_rendimentoColectavel.text(`${numeral(rendimentoColectavel).format(formato)}€`);

  var span_taxa = $('#taxa')
  span_taxa.text(taxa);

  var span_coletaTotal = $('#coletaTotal')
  span_coletaTotal.text(`${numeral(coletaTotal).format(formato)}€`);

  var span_deducoesColeta = $('#deducoesColeta')
  span_deducoesColeta.text(`${numeral(deducoesColeta).format(formato)}€`);

  var span_coletaLiquida = $('#coletaLiquida')
  span_coletaLiquida.text(`${numeral(fIrsAtual).format(formato)}€`);

  // Onde irá aparecer o valor de IRS segundo a proposta da IL
  var span_irsIL = $('#irsIL');
  var fIrsIL = numeral(irsIL).format(formato);
  span_irsIL.text(`${fIrsIL}€`);

  var span_irsILTexto = $('#nomeProposta');
  if (il_escaloes === "1") {
    var fIrsILTexto = "Flat tax (15%)";
  } else {
    var fIrsILTexto = "2 escalões (15%; 28%)";
  }
  span_irsILTexto.text(fIrsILTexto);

  // Diferença entre o IRS do actual sistema e da proposta da IL
  var span_diff = $('#diff');
  var diff = irsActual - irsIL;
  var fDiff = numeral(diff).format(formato);
  if (diff<0) {
    span_diff.removeClass('bg-secondary');
    span_diff.removeClass('bg-success');
    span_diff.addClass('bg-danger');
    span_diff.text(`${fDiff}€`);
  } else {
    span_diff.removeClass('bg-secondary');
    span_diff.removeClass('bg-danger');
    span_diff.addClass('bg-success');
    span_diff.text(`${fDiff}€`);
  }

}


function pad(value) {
  var v = numeral(value).format(formato2);

  return v.padStart(9-v.length, "|").replaceAll("|", "&nbsp;");
}


function atualizarTabelaRendimentos(rendimentoBase, irsActualBase, valorTrabalhadorBase, valorEstadoBase, pagoEmpresaBase,
  rendimentoA, rendimentoB, estadoCivil, tributacao, ascendentes, dependentes3Menos, dependentes3Mais,
  despesasGerais, despesasSaude, despesasEducacao, despesasHabitacao, despesasLares, despesasPensoesAlimentos,
  despesasAutomoveis, despesasMotociclos, despesasRestauracao, despesasCabeleireiros, despesasVeterinario, despesasPasses, fn)
  {

    $("#tabelaRendimentos").empty()

    $("#tabelaRendimentos").append(`
      <thead>
        <tr>
          <th scope="colgroup" rowspan="2" class="text-center align-middle">Mensal</th>
          <th scope="colgroup" rowspan="2" colspan="2" class="text-center align-middle">Rendimento Anual Bruto</th>
          <th scope="col" colspan="2" rowspan="2" class="text-center align-middle" data-toggle="tooltip" data-placement="top" data-container="body" title="A contar com a TSU da empresa">Empresa pagou</th>
          <th scope="col" colspan="4" class="text-center align-middle">Você recebe</th>
          <th scope="col" colspan="4" class="text-center align-middle">Estado recebe</th>
        </tr>
        <tr>
          <th scope="col" colspan="2" class="text-center align-middle">Sistema Actual</th>
          <th scope="col" colspan="2" class="text-center align-middle">Com a IL</th>
          <th scope="col" colspan="2" class="text-center align-middle">Sistema Actual</th>
          <th scope="col" colspan="2" class="text-center align-middle">Com a IL</th>
        </tr>
      </thead>`
    );

    var tbody = '';

    [0, 50, 100, 200, 300].forEach(incremento => {

      var rendA = rendimentoA + incremento*14/2;
      var rendB = rendimentoB > 0 ? rendimentoB + incremento*14/2 : 0;

      var irsActual = calcularIRS(
        rendA, rendB, estadoCivil, tributacao, ascendentes, dependentes3Menos, dependentes3Mais,
        despesasGerais, despesasSaude, despesasEducacao, despesasHabitacao, despesasLares, despesasPensoesAlimentos,
        despesasAutomoveis, despesasMotociclos, despesasRestauracao, despesasCabeleireiros, despesasVeterinario, despesasPasses
      )[5];

      var irsIL = fn(
        rendA, rendB, estadoCivil, tributacao, dependentes3Menos, dependentes3Mais, despesasPensoesAlimentos
      );

      var [valorTrabalhador, valorEstado, pagoEmpresa] = calcularRendLiquido(rendA, rendB, irsActual);
      var [valorTrabalhadorIL, valorEstadoIL, pagoEmpresaIL] = calcularRendLiquido(rendA, rendB, irsIL);

      var d1 = valorTrabalhadorIL-valorTrabalhadorBase;
      var d2 = valorEstadoIL-valorEstadoBase;

      tbody = tbody + `
          <tr>
            <td class="text-right">+${pad(incremento)}€</td>

            <td class="text-right">${pad(rendA+rendB)}€</td>
            <td class="text-right text-muted"><small>+${pad(rendA+rendB-rendimentoBase)}€</small></td>

            <td class="text-right">${pad(pagoEmpresa)}€</td>
            <td class="text-right text-muted"><small>+${pad(pagoEmpresa-pagoEmpresaBase)}€</small></td>

            <td class="text-right">${pad(valorTrabalhador)}€</td>
            <td class="text-right text-muted"><small>+${pad(valorTrabalhador-valorTrabalhadorBase)}€</small></td>

            <td class="text-right">${pad(valorTrabalhadorIL)}€</td>
            <td class="text-right text-muted"><small>${d1 >= 0 ? '+' : '-'}${pad(Math.abs(d1))}€</small></td>

            <td class="text-right">${pad(valorEstado)}€</td>
            <td class="text-right text-muted"><small>+${pad(valorEstado-valorEstadoBase)}€</small></td>

            <td class="text-right">${pad(valorEstadoIL)}€</td>
            <td class="text-right text-muted"><small>${d2 >= 0 ? '+' : '-'}${pad(Math.abs(d2))}€</small></td>
          </tr>`
      ;

    });

    $("#tabelaRendimentos").append(`<tbody>${tbody}</tbody>`).hide();
}


function main(il_escaloes) {

    // Obter os valores inseridos pelo utilizador no formulário
    var rendimentoA = Number($("#rendA").val());
    // Quando não há rendimento fica com 0
    var rendimentoB = Number($("#rendB").val());
    var estadoCivil = $("#estadoCivil option:selected").text();
    var tributacao = $("#tributacao option:selected").text();
    var ascendentes = Number($("#ascendentes").val());
    var dependentes3Menos = Number($("#dependentes3menos").val());
    // Maior ou igual
    var dependentes3Mais = Number($("#dependentes3mais").val());

    // Deduçōes à coleta - quando não há valor fica com 0
    var despesasGerais = Number($("#despesasGerais").val());
    var despesasSaude = Number($("#despesasSaude").val());
    var despesasEducacao = Number($("#despesasEducacao").val());
    var despesasHabitacao = Number($("#despesasHabitacao").val());
    var despesasLares = Number($("#despesasLares").val());
    var despesasPensoesAlimentos = Number($("#despesasPensoesAlimentos").val());
    var despesasAutomoveis = Number($("#despesasAutomoveis").val());
    var despesasMotociclos = Number($("#despesasMotociclos").val());
    var despesasRestauracao = Number($("#despesasRestauracao").val());
    var despesasCabeleireiros = Number($("#despesasCabeleireiros").val());
    var despesasVeterinario = Number($("#despesasVeterinario").val());
    var despesasPasses = Number($("#despesasPasses").val());

    // ter a certeza que este rendimento é 0 nesta condição
    if (estadoCivil==='Solteiro, divorciado, viúvo ou separado judicialmente') {
      rendimentoB = 0;
    }

    if (debug) {
      console.log(il_escaloes);
    }

    //ano = Number($("#anoCivil").val());
    //carregarEscaloesIRS(); // not implemented

    var [deducoesEspecificas, rendimentoColectavel, taxa, coletaTotal, deducoesColeta, irsActual] = calcularIRS(
      rendimentoA, rendimentoB, estadoCivil, tributacao, ascendentes, dependentes3Menos, dependentes3Mais,
      despesasGerais, despesasSaude, despesasEducacao, despesasHabitacao, despesasLares, despesasPensoesAlimentos,
      despesasAutomoveis, despesasMotociclos, despesasRestauracao, despesasCabeleireiros, despesasVeterinario, despesasPasses
    );

    if (il_escaloes === "1") {
      var irsIL = calcularIRS_IL_flat(
        rendimentoA, rendimentoB, estadoCivil, dependentes3Menos, dependentes3Mais, ascendentes
      );
      var fn = calcularIRS_IL_flat;
    } else {
      var irsIL = calcularIRS_IL_2escaloes(
        rendimentoA, rendimentoB, estadoCivil, dependentes3Menos, dependentes3Mais, ascendentes
      );
      var fn = calcularIRS_IL_2escaloes;
    }

    var [valorTrabalhador, valorEstado, pagoEmpresa] = calcularRendLiquido(rendimentoA, rendimentoB, irsActual);

    atualizarTabelaIRS(
      irsActual, irsIL, il_escaloes, rendimentoA, rendimentoB, estadoCivil, tributacao, ascendentes, dependentes3Menos + dependentes3Mais,
      deducoesEspecificas, rendimentoColectavel, taxa, coletaTotal, deducoesColeta, valorTrabalhador, valorEstado
    );

    //atualizarTabelaRendimentos(
    //  (rendimentoA+rendimentoB), irsActual, valorTrabalhador, valorEstado, pagoEmpresa,
    //  rendimentoA, rendimentoB, estadoCivil, tributacao, ascendentes, dependentes3Menos, dependentes3Mais,
    //  despesasGerais, despesasSaude, despesasEducacao, despesasHabitacao, despesasLares, despesasPensoesAlimentos,
    //  despesasAutomoveis, despesasMotociclos, despesasRestauracao, despesasCabeleireiros, despesasVeterinario, despesasPasses, fn
    //);

}

function aumento() {

  // Obter os valores inseridos pelo utilizador no formulário
  var rendimentoA = Number($("#rendA").val());
  // Quando não há rendimento fica com 0
  var rendimentoB = Number($("#rendB").val());
  var estadoCivil = $("#estadoCivil option:selected").text();
  var tributacao = $("#tributacao option:selected").text();
  var ascendentes = Number($("#ascendentes").val());
  var dependentes3Menos = Number($("#dependentes3menos").val());
  // Maior ou igual
  var dependentes3Mais = Number($("#dependentes3mais").val());

  // Deduçōes à coleta - quando não há valor fica com 0
  var despesasGerais = Number($("#despesasGerais").val());
  var despesasSaude = Number($("#despesasSaude").val());
  var despesasEducacao = Number($("#despesasEducacao").val());
  var despesasHabitacao = Number($("#despesasHabitacao").val());
  var despesasLares = Number($("#despesasLares").val());
  var despesasPensoesAlimentos = Number($("#despesasPensoesAlimentos").val());
  var despesasAutomoveis = Number($("#despesasAutomoveis").val());
  var despesasMotociclos = Number($("#despesasMotociclos").val());
  var despesasRestauracao = Number($("#despesasRestauracao").val());
  var despesasCabeleireiros = Number($("#despesasCabeleireiros").val());
  var despesasVeterinario = Number($("#despesasVeterinario").val());
  var despesasPasses = Number($("#despesasPasses").val());

  // ter a certeza que este rendimento é 0 nesta condição
  if (estadoCivil==='Solteiro, divorciado, viúvo ou separado judicialmente') {
    rendimentoB = 0;
  }

  var irsActualBase = calcularIRS(
    rendimentoA, rendimentoB, estadoCivil, tributacao, ascendentes, dependentes3Menos, dependentes3Mais,
    despesasGerais, despesasSaude, despesasEducacao, despesasHabitacao, despesasLares, despesasPensoesAlimentos,
    despesasAutomoveis, despesasMotociclos, despesasRestauracao, despesasCabeleireiros, despesasVeterinario, despesasPasses
  )[5];

  var [valorTrabalhadorBase, valorEstadoBase, pagoEmpresaBase] = calcularRendLiquido(rendimentoA, rendimentoB, irsActualBase);

  var aumento = Number($("#aumento").val());
  var rendA = rendimentoA + aumento*14;
  var rendB = rendimentoB;

  var irsActual = calcularIRS(
    rendA, rendB, estadoCivil, tributacao, ascendentes, dependentes3Menos, dependentes3Mais,
    despesasGerais, despesasSaude, despesasEducacao, despesasHabitacao, despesasLares, despesasPensoesAlimentos,
    despesasAutomoveis, despesasMotociclos, despesasRestauracao, despesasCabeleireiros, despesasVeterinario, despesasPasses
  )[5];

  var [valorTrabalhador, valorEstado, pagoEmpresa] = calcularRendLiquido(rendA, rendB, irsActual);
  
  var d1 = numeral((valorTrabalhador-valorTrabalhadorBase)/14).format(formato);
  var d2 = numeral((valorEstado-valorEstadoBase)/14).format(formato);
  var d3 = numeral((pagoEmpresa-pagoEmpresaBase)/14).format(formato);

  p_aumento = $('#aumentoTexto');
  p_aumento.text(`Se a empresa aumentar o sujeito passivo A em ${aumento}€ bruto mensal: esta paga ${d3}€, o Estado fica com ${d2}€ e o sujeito passivo A fica com ${d1}€.`);
  p_aumento.removeClass('d-none');
  
}


/*
function changeVideo(btn,ep) {
  $('.btnVideos').each(function(i, obj) {
    $(obj).removeClass('btnVideosHover');
  });
  $(btn).toggleClass('btnVideosHover');

  if (ep===1) {
    $('#video').attr('src', 'https://www.youtube.com/embed/up0Gfd5c0cM');
    $('#descVideo').text('Video 1');
  } else if (ep===2) {
    $('#video').attr('src', 'https://www.youtube.com/embed/2nBGppKe1z4');
    $('#descVideo').text('Video 2');
  } else if (ep===3) {
    $('#video').attr('src', 'https://www.youtube.com/embed/OERxKenLIo8');
    $('#descVideo').text('Video 3');
  } else if (ep===4) {

  } else {

  }

}
*/


(function () {
  'use strict'

  window.addEventListener('load', function () {
    // Fetch all the forms we want to apply custom Bootstrap validation styles to
    var forms = document.getElementsByClassName('needs-validation')

    // Disabling form submissions if there are invalid fields
    // and prevent submission to keep the values
    Array.prototype.filter.call(forms, function (form) {
      form.addEventListener('submit', function (event) {
        if (form.checkValidity() === false) {
          event.preventDefault()
          event.stopPropagation()
        } else {
          if ($(form).attr('id') === "formIRS") {
            main($(event.submitter).val());
          } else {
            //$("#tabelaRendimentos").show();
            if ($('#formIRS')[0].checkValidity()) {
              aumento();
            } else {
              event.preventDefault()
              event.stopPropagation()
              $('#formAumento').addClass('was-validated');

            }
          }
          // Avoid form from resetting the selected values
          event.preventDefault();
        }
        form.classList.add('was-validated');
      }, false)
    });

    // Enable / disable options
    $('#estadoCivil').change(function(){
      if($(this).val() === 'Casado/Unido de facto') {
        $('#rendB').prop('disabled',false);
        $('#tributacao').prop('disabled',false);
      } else {
        $('#rendB').prop('disabled',true);
        $('#tributacao').prop('disabled',true);
      }
    });

    // enable tooltips
    $('input').tooltip();
    $('[data-toggle="tooltip"]').tooltip();

    // auto collapse the navbar
    $('#navbarCollapse a').click(function(){
      $('#navbarCollapse').collapse('hide');
    });
  }, false)
}());
