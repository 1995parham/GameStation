<xsl:stylesheet version="1.0" xmlns:xsl="http://www.w3.org/1999/XSL/Transform">

    <xsl:template match="/">
        <div id="sudoku">
            <table>
                <xsl:for-each select="/sudoku/row">
                    <tr>
                        <xsl:for-each select="./cell">
                            <xsl:choose>
                                <xsl:when test=". != ''">
                                    <td contenteditable="false" class="cell">
                                        <xsl:value-of select="."/>
                                    </td>
                                </xsl:when>
                                <xsl:otherwise>
                                    <td contenteditable="true" class="cell">
                                        <xsl:value-of select="."/>
                                    </td>
                                </xsl:otherwise>
                            </xsl:choose>
                        </xsl:for-each>
                    </tr>
                </xsl:for-each>
            </table>
        </div>
        <div id="check-sudoku">Check it out!</div>
        <div id="submit-sudoku">Submit</div>
    </xsl:template>

</xsl:stylesheet>