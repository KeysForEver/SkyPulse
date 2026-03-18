1.

- Na tela "Ordens de Produção", alterar o texto do botão "+NOVO" para "+ NOVA ORDEM DE PRODUÇÃO".
- Na tela "Clientes", alterar o texto do botão "+NOVO" para "+ NOVO CLIENTE".
- Na tela 'ESTOQUE' alterar o texto do botão 'Novo Produto' para o texto '+ NOVO PRODUTO' tudo maiusculo e com o '+'.

2.

- Remover todos os textos de exemplo que aparecem dentro das labels dos campos que o usuário precisa preencher.
- Se o campo for de data, definir como valor padrão a data atual.
- Se o campo for uma lista, definir como valor padrão o texto "SELECIONE UM ITEM DA LISTA".

3.

- Na tela "Nova Ordem", implementar uma verificação que impeça a "Data de Entrega" ser menor que a "Data de Entrada".
- Caso o usuário tente inserir uma data inválida, exibir uma mensagem de alerta informando o erro e solicitar a correção.

4.

- Nas telas "Nova Ordem", "Novo Cliente", "Novo Fornecedor", "Novo Patrimônio", "Novo Produto", "Entrada de Estoque", "Saída de Estoque" e "Detalhes do Lançamento", configurar os modais para terem tamanho fixo de 2/3 da tela, tanto na dimensão horizontal quanto na vertical.
- Os modais devem seguir um padrão único, reaproveitando o mesmo código de layout e design para todas as telas mencionadas.

5.

- Nas telas "Ordem de Produção", "Clientes", "Fornecedores" e "Financeiro", os botões "PDF" devem seguir a mesma lógica já implementada nas telas de "Estoque" e "Patrimônio".
- Ao clicar no botão "PDF", deve ser exibido o modal "Opções de Exportação PDF", permitindo ao usuário escolher quais colunas incluir no relatório.
- Reaproveitar o código existente de layout e design para manter o padrão único em todas as telas.

6.

- Garantir que todos os botões da aplicação tenham o efeito de hover aplicado de forma consistente.
- Corrigir os botões que atualmente não possuem esse efeito, aplicando o mesmo padrão de layout e design já utilizado nos demais.
- Centralizar a lógica de hover em um único trecho de código, de forma que seja reaproveitado em todos os botões, evitando duplicação e simplificando a manutenção do projeto.

7.

- Na tela "Nova Ordem", corrigir o campo "Cliente" para que exiba corretamente todas as opções da lista, incluindo clientes PF e PJ.
- Atualmente, os clientes PJ aparecem sem texto (apenas espaço em branco). Ajustar para que o nome/identificação do cliente PJ seja exibido normalmente, assim como já ocorre com os clientes PF.

8.

- Nas telas "Clientes", "Fornecedores" e "Financeiro", incluir a coluna "ID" para cada registro.
- A coluna deve seguir o mesmo padrão já implementado nas demais telas, garantindo consistência de layout, design e funcionalidade.

9.

- Nas telas "Ordem de Produção", "Clientes", "Fornecedores", "Patrimônio", "Financeiro" e "Histórico", implementar um cabeçalho com barra de pesquisa e botões seguindo exatamente o mesmo layout/design já utilizado na tela de "Estoque".
- A barra de pesquisa deve conter o ícone de lupa dentro da label, conforme o padrão da tela de Estoque.
- Os botões devem manter o mesmo estilo visual e comportamento, garantindo consistência em todas as telas.
- Reaproveitar o código de layout e design já existente, evitando duplicação e assegurando um padrão único em todo o sistema.

10.

- Nas telas "NOVO CLIENTE" e "NOVO FORNECEDOR', implementar validações nos campos CPF, CNPJ, CEP, Telefone e E-mail.
- Cada campo deve verificar se o valor digitado atende aos requisitos corretos:
- RAZÃO SOCIAL/CPF/CNPJ/CEP: validar formato e quantidade de dígitos.
- Telefone: validar se contém apenas números e segue o formato definido.
- E-mail: validar se possui estrutura correta (ex.: usuario@dominio.com).
- Caso o usuário insira dados inválidos, exibir uma mensagem de alerta solicitando a correção.